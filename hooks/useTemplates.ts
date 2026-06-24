'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  db, collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp,
} from '@/lib/firebase';
import type { ApplicationTemplate, CreateTemplateForm, JobType } from '@/types';
import { useAuthStore } from '@/stores/authStore';

// Fetch all templates for the current student
export function useApplicationTemplates() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['applicationTemplates', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const templatesRef = collection(db, 'application_templates');
      const templatesQuery = query(templatesRef, where('student_id', '==', user.uid), orderBy('created_at', 'desc'));
      const snap = await getDocs(templatesQuery);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ApplicationTemplate[];
    },
    enabled: !!user,
  });
}

// Get the best template for a job type
export function useBestTemplate(jobType: JobType | undefined) {
  const { data: templates } = useApplicationTemplates();
  if (!templates || templates.length === 0) return null;

  if (jobType) {
    const jobTypeTemplate = templates.find((t) => t.job_type === jobType);
    if (jobTypeTemplate) return jobTypeTemplate;
  }

  const defaultTemplate = templates.find((t) => t.is_default);
  if (defaultTemplate) return defaultTemplate;

  const generalTemplate = templates.find((t) => !t.job_type);
  if (generalTemplate) return generalTemplate;

  return templates[0];
}

// Create a new template
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (templateData: CreateTemplateForm) => {
      if (!user) throw new Error('Not authenticated');

      if (templateData.is_default) {
        const templatesRef = collection(db, 'application_templates');
        const existingQuery = query(templatesRef, where('student_id', '==', user.uid), where('is_default', '==', true));
        const existingSnap = await getDocs(existingQuery);
        for (const docSnap of existingSnap.docs) {
          await updateDoc(docSnap.ref, { is_default: false });
        }
      }

      const templatesRef = collection(db, 'application_templates');
      const docRef = await addDoc(templatesRef, {
        ...templateData,
        student_id: user.uid,
        job_type: templateData.job_type || null,
        is_default: templateData.is_default || false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...templateData,
        student_id: user.uid,
        job_type: templateData.job_type || null,
        is_default: templateData.is_default || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ApplicationTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationTemplates', user?.uid] });
    },
  });
}

// Update a template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ templateId, updates }: { templateId: string; updates: Partial<CreateTemplateForm> }) => {
      if (!user) throw new Error('Not authenticated');

      if (updates.is_default) {
        const templatesRef = collection(db, 'application_templates');
        const existingQuery = query(templatesRef, where('student_id', '==', user.uid), where('is_default', '==', true));
        const existingSnap = await getDocs(existingQuery);
        for (const docSnap of existingSnap.docs) {
          if (docSnap.id !== templateId) {
            await updateDoc(docSnap.ref, { is_default: false });
          }
        }
      }

      const templateRef = doc(db, 'application_templates', templateId);
      await updateDoc(templateRef, { ...updates, updated_at: serverTimestamp() });
      return { templateId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationTemplates', user?.uid] });
    },
  });
}

// Delete a template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!user) throw new Error('Not authenticated');
      await deleteDoc(doc(db, 'application_templates', templateId));
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationTemplates', user?.uid] });
    },
  });
}

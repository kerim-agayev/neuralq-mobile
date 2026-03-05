import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from './api';
import { storage } from '../utils/storage';
import { StartTestResponse, TestResult, AnswerInput, AnswerResponse } from '../types';

export const testService = {
  startTest: async (mode: 'ARCADE' | 'FULL_ANALYSIS', language: string) => {
    const { data } = await api.post<{ success: boolean; data: StartTestResponse }>(
      '/tests/start',
      { mode, language },
    );
    return data.data;
  },

  submitAnswer: async (sessionId: string, answer: AnswerInput) => {
    const { data } = await api.post<{ success: boolean; data: AnswerResponse }>(
      `/tests/${sessionId}/answer`,
      answer,
    );
    return data.data;
  },

  completeTest: async (sessionId: string) => {
    const { data } = await api.post<{ success: boolean; data: TestResult }>(
      `/tests/${sessionId}/complete`,
    );
    return data.data;
  },

  getResult: async (sessionId: string) => {
    const { data } = await api.get<{ success: boolean; data: TestResult }>(
      `/tests/${sessionId}/result`,
    );
    return data.data;
  },

  getHistory: async () => {
    const { data } = await api.get<{ success: boolean; data: TestResult[] }>(
      '/tests/history',
    );
    return data.data;
  },

  getLastResult: async () => {
    const { data } = await api.get<{ success: boolean; data: TestResult[] }>(
      '/tests/history',
    );
    const results = data.data;
    return results.length > 0 ? results[0] : null;
  },

  downloadCertificate: async (resultId: string): Promise<void> => {
    const token = await storage.getAccessToken();
    const baseUrl = api.defaults.baseURL;

    const response = await fetch(`${baseUrl}/results/${resultId}/certificate`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Certificate download failed');
    }

    const arrayBuffer = await response.arrayBuffer();
    const file = new File(Paths.cache, `neuralq-certificate-${resultId}.pdf`);
    file.write(new Uint8Array(arrayBuffer));

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'NeuralQ Certificate',
      });
    }
  },
};

import { useMutation } from '@tanstack/react-query';
import { startManualMailWorkflow } from '../api/manual-mail-workflow.api';
import type {
  StartManualMailWorkflowRequest,
  StartManualMailWorkflowResponse,
} from '../types/manual-mail-workflow.types';

export const useStartManualMailWorkflow = () => {
  return useMutation<StartManualMailWorkflowResponse, unknown, StartManualMailWorkflowRequest>({
    mutationFn: (payload: StartManualMailWorkflowRequest) => startManualMailWorkflow(payload),
  });
};

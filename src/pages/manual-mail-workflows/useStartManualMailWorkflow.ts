import { useMutation } from '@tanstack/react-query';
import { startManualMailWorkflow } from './manual-mail-workflow.api';
import type {
  StartManualMailWorkflowRequest,
  StartManualMailWorkflowResponse,
} from './manual-mail-workflow.types';

export const useStartManualMailWorkflow = () =>
  useMutation<StartManualMailWorkflowResponse, unknown, StartManualMailWorkflowRequest>({
    mutationFn: (payload: StartManualMailWorkflowRequest) => startManualMailWorkflow(payload),
  });

import { useSyncExternalStore } from "react"
import {
  campaignExecutionStore,
  type CampaignExecutionState,
} from "../services/campaignExecutionStore"
import {
  campaignDraftStore,
  type CampaignDraftState,
} from "../services/campaignDraftStore"

export function useCampaignExecution(): CampaignExecutionState {
  return useSyncExternalStore(
    campaignExecutionStore.subscribe,
    campaignExecutionStore.getState,
    campaignExecutionStore.getState,
  )
}

export function useCampaignDraft(): CampaignDraftState {
  return useSyncExternalStore(
    campaignDraftStore.subscribe,
    campaignDraftStore.getDraft,
    campaignDraftStore.getDraft,
  )
}

export { campaignExecutionStore, campaignDraftStore }
export type { CampaignExecutionState, CampaignDraftState }

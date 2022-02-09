export abstract class BaseRequest {
  readonly controller: any;
}

export abstract class SyncRequest extends BaseRequest {
  readonly object: any;
  readonly attachments: any[];
  readonly related: any;
  readonly finalizing: boolean;
}

export abstract class FinalizeRequest extends SyncRequest {
}

export abstract class CustomizeRequest extends BaseRequest {
  readonly parent: any;
}

export abstract class SyncResponse {
  readonly labels?: { [key: string]: string };
  readonly annotations?: { [key: string]: string };
  readonly status?: any;
  readonly attachments?: any[];
  readonly resyncAfterSeconds?: number;
}

export abstract class FinalizeResponse extends SyncResponse {
  readonly finalized: boolean;
}

export abstract class CustomizeResponse {
  readonly relatedResources: any[];
}

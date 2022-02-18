import { ApiObject, ApiObjectProps, Chart } from 'cdk8s';

export interface BaseRequest {
  readonly controller: ApiObjectProps;
}

export interface SyncRequest extends BaseRequest {
  readonly object: ApiObjectProps;
  readonly attachments: ApiObjectProps[];
  readonly related: { [key: string]: { [key: string]: ApiObjectProps } };
  readonly finalizing: boolean;
}

export interface FinalizeRequest extends SyncRequest {
}

export interface CustomizeRequest extends BaseRequest {
  readonly parent: ApiObjectProps;
}

export interface SyncResponseProps {
  readonly labels?: { [key: string]: string };
  readonly annotations?: { [key: string]: string };
  readonly status?: any;
  readonly attachments?: Chart;
  readonly resyncAfterSeconds?: number;
}

export interface FinalizeResponseProps extends SyncResponseProps {
  readonly finalized: boolean;
}

export interface CustomizeResponseRelatedResource {
  apiVersion: string,
  resource: string,
  namespace: string,
  names: string[]
}
export interface CustomizeResponseProps {
  readonly relatedResources: CustomizeResponseRelatedResource[];
}

export class SyncResponse {
  constructor(protected props: SyncResponseProps) { }

  toJson(): any {
    return {
      labels: this.props.labels,
      annotations: this.props.annotations,
      status: this.props.status,
      attachments: this.props.attachments.toJson(),
      resyncAfterSeconds: this.props.resyncAfterSeconds
    };
  }
}

export class CustomizeResponse {
  constructor(protected props: CustomizeResponseProps) { }

  toJson(): any {
    return {
      relatedResources: this.props.relatedResources
    };
  }
}

export class FinalizeResponse extends SyncResponse {
  constructor(props: FinalizeResponseProps) {
    super(props);
  }

  toJson(): any {
    return {
      ...super.toJson(),
      finalized: (this.props as FinalizeResponseProps).finalized
    };
  }
}

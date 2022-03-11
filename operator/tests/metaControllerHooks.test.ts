import { ApiObjectProps } from 'cdk8s';
import { BaseRequest, CustomizeRequest, CustomizeResponse, CustomizeResponseProps, FinalizeRequest, FinalizeResponse, FinalizeResponseProps, SyncRequest, SyncResponse, SyncResponseProps } from '../metaControllerHooks';

test('metaControllerHooks BaseRequest', () => {
  class BaseRequestImp implements BaseRequest {
    controller: ApiObjectProps;
  }
  expect(new BaseRequestImp()).not.toBeNull();
});

test('metaControllerHooks SyncRequest', () => {
  class SyncRequestImp implements SyncRequest {
    object: ApiObjectProps;
    attachments: ApiObjectProps[];
    related: { [key: string]: ApiObjectProps[]; };
    finalizing: boolean;
    controller: ApiObjectProps;
  }
  expect(new SyncRequestImp()).not.toBeNull();
});

test('metaControllerHooks FinalizeRequest', () => {
  class FinalizeRequestImp implements FinalizeRequest {
    object: ApiObjectProps;
    attachments: ApiObjectProps[];
    related: { [key: string]: ApiObjectProps[]; };
    finalizing: boolean;
    controller: ApiObjectProps;
  }
  expect(new FinalizeRequestImp()).not.toBeNull();
});

test('metaControllerHooks CustomizeRequest', () => {
  class CustomizeRequestImp implements CustomizeRequest {
    parent: ApiObjectProps;
    controller: ApiObjectProps;
  }
  expect(new CustomizeRequestImp()).not.toBeNull();
});

test('metaControllerHooks SyncResponse', () => {
  class SyncResponseImp extends SyncResponse { }
  expect(new SyncResponseImp({} as SyncResponseProps)).not.toBeNull();
});

test('metaControllerHooks SyncResponse toJson', () => {
  class SyncResponseImp extends SyncResponse { }
  expect(new SyncResponseImp(undefined as SyncResponseProps).toJson()).not.toBeNull();
});

test('metaControllerHooks SyncResponse toJson', () => {
  class SyncResponseImp extends SyncResponse { }
  expect(new SyncResponseImp({ labels: { t: '' } } as SyncResponseProps).toJson()).not.toBeNull();
});

test('metaControllerHooks SyncResponse toJson', () => {
  class SyncResponseImp extends SyncResponse { }
  expect(new SyncResponseImp({ resyncAfterSeconds: 1 } as SyncResponseProps).toJson()).not.toBeNull();
});

test('metaControllerHooks FinalizeResponse', () => {
  class FinalizeResponseImp extends FinalizeResponse { }
  expect(new FinalizeResponseImp({} as FinalizeResponseProps)).not.toBeNull();
});

test('metaControllerHooks CustomizeResponse', () => {
  class CustomizeResponseImp extends CustomizeResponse { }
  expect(new CustomizeResponseImp({} as CustomizeResponseProps)).not.toBeNull();
});

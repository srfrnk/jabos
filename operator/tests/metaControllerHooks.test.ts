import { BaseRequest, CustomizeRequest, CustomizeResponse, FinalizeRequest, FinalizeResponse, SyncRequest, SyncResponse } from '../metaControllerHooks';

test('metaControllerHooks BaseRequest', () => {
  class BaseRequestImp extends BaseRequest { };
  expect(new BaseRequestImp()).not.toBeNull();
});

test('metaControllerHooks SyncRequest', () => {
  class SyncRequestImp extends SyncRequest { };
  expect(new SyncRequestImp()).not.toBeNull();
});

test('metaControllerHooks FinalizeRequest', () => {
  class FinalizeRequestImp extends FinalizeRequest { };
  expect(new FinalizeRequestImp()).not.toBeNull();
});

test('metaControllerHooks CustomizeRequest', () => {
  class CustomizeRequestImp extends CustomizeRequest { };
  expect(new CustomizeRequestImp()).not.toBeNull();
});

test('metaControllerHooks SyncResponse', () => {
  class SyncResponseImp extends SyncResponse { };
  expect(new SyncResponseImp()).not.toBeNull();
});

test('metaControllerHooks FinalizeResponse', () => {
  class FinalizeResponseImp extends FinalizeResponse { };
  expect(new FinalizeResponseImp()).not.toBeNull();
});

test('metaControllerHooks CustomizeResponse', () => {
  class CustomizeResponseImp extends CustomizeResponse { };
  expect(new CustomizeResponseImp()).not.toBeNull();
});

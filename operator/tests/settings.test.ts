import settings from '../settings';

test('settings ', () => {
  process.env.NAMESPACE = '1234';
  expect(settings.namespace()).toBe('1234');
});

test('settings ', () => {
  process.env.PORT = '1234';
  expect(settings.port()).toBe('1234');
});

test('settings ', () => {
  process.env.IMAGE_PREFIX = '1234';
  expect(settings.imagePrefix()).toBe('1234');
});

test('settings buildNumber', () => {
  process.env.BUILD_NUMBER = '1234';
  expect(settings.buildNumber()).toBe('1234');
});

test('settings debug', () => {
  process.env.IS_PRODUCTION = 'true';
  expect(settings.debug()).toBe(false);
  process.env.IS_PRODUCTION = 'false';
  expect(settings.debug()).toBe(true);
});

test('settings imagePullPolicy', () => {
  process.env.IS_PRODUCTION = 'true';
  expect(settings.imagePullPolicy()).toBe('Always');
  process.env.IS_PRODUCTION = 'false';
  expect(settings.imagePullPolicy()).toBe('IfNotPresent');
});

test('settings prometheusMetricPrefix', () => {
  process.env.PROMETHEUS_METRIC_PREFIX = '1234';
  expect(settings.prometheusMetricPrefix()).toBe('1234');
});

test('settings jobActiveDeadlineSeconds', () => {
  process.env.JOB_ACTIVE_DEADLINE_SECONDS = '1234';
  expect(settings.jobActiveDeadlineSeconds()).toBe('1234');
});

test('settings jobBackoffLimit', () => {
  process.env.JOB_BACKOFF_LIMIT = '1234';
  expect(settings.jobBackoffLimit()).toBe('1234');
});

test('settings jobTtlSecondsAfterFinished', () => {
  process.env.JOB_TTL_SECONDS_AFTER_FINISHED = '1234';
  expect(settings.jobTtlSecondsAfterFinished()).toBe('1234');
});

test('settings expressJsonRequestPayloadLimit', () => {
  process.env.EXPRESS_JSON_REQUEST_PAYLOAD_LIMIT = '1234';
  expect(settings.expressJsonRequestPayloadLimit()).toBe('1234');
});

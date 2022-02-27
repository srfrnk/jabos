import settings from '../settings';

export function setMock() {
  for (const key of Object.keys(settings)) {
    settings[key] = jest.fn();
  }

  (settings.namespace as jest.Mock).mockReturnValue('settings_namespace');
  (settings.port as jest.Mock).mockReturnValue('1234');
  (settings.imagePrefix as jest.Mock).mockReturnValue('settings_imagePrefix');
  (settings.buildNumber as jest.Mock).mockReturnValue('settings_build_number');
  (settings.debug as jest.Mock).mockReturnValue('true');
  (settings.imagePullPolicy as jest.Mock).mockReturnValue('Always');
  (settings.prometheusMetricPrefix as jest.Mock).mockReturnValue('settings_prometheusMetricPrefix');
  (settings.jobActiveDeadlineSeconds as jest.Mock).mockReturnValue('1234');
  (settings.jobBackoffLimit as jest.Mock).mockReturnValue('1234');
  (settings.jobTtlSecondsAfterFinished as jest.Mock).mockReturnValue('1234');
  (settings.expressJsonRequestPayloadLimit as jest.Mock).mockReturnValue('1234');
}

export function clearMock() {
  for (const key of Object.keys(settings)) {
    (settings[key] as jest.Mock).mockRestore();
  }
}

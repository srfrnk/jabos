import { Container } from './imports/k8s';
import settings from './settings';
import * as _ from 'lodash';

export default (imageBase: string, props: Container): Container => {
  return _.merge(
    {
      image: `${settings.imagePrefix()}${imageBase}:${settings.buildNumber()}`,
      livenessProbe: {
        initialDelaySeconds: 10,
        periodSeconds: 30,
        timeoutSeconds: 5,
        failureThreshold: 3,
        successThreshold: 1,
      },
      readinessProbe: {
        initialDelaySeconds: 10,
        periodSeconds: 30,
        timeoutSeconds: 5,
        failureThreshold: 3,
        successThreshold: 1,
      },
      imagePullPolicy: settings.isProduction() ? 'Always' : 'IfNotPresent',
      securityContext: {
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        runAsNonRoot: true,
        capabilities: {
          drop: ['ALL'],
        },
      },
    },
    props);
}

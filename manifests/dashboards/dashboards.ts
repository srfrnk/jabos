import { Construct } from 'constructs';
import * as fs from 'fs';
import { GrafanaDashboard } from '../imports/grafana.operators';
import settings from '../settings';

export default class Dashboards extends GrafanaDashboard {
  constructor(scope: Construct) {
    super(scope, 'Dashboards', {
      metadata: {
        name: 'grafana-dashboards',
        namespace: settings.jabosNamespace()
      },
      spec: {
        grafonnet: {
          'SystemDashboard.jsonnet': fs.readFileSync('./dashboards/SystemDashboard.grafonnet', { encoding: 'utf-8' }),
          'GitOpsDashboard.jsonnet': fs.readFileSync('./dashboards/GitOpsDashboard.grafonnet', { encoding: 'utf-8' }),
        }
      }
    });
  }
}

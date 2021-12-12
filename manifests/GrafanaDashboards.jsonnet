function(imagePrefix, buildNumber, namespace, isProduction) (
  local grafanaDashboard = import './grafana-dashboard.libsonnet';
  local globals = import './globals.libsonnet';
  grafanaDashboard.GrafanaDashboard(name='grafana-dashboards', namespace=namespace, grafonnet={
    'SystemDashboard.jsonnet': importstr './SystemDashboard.grafonnet',
    'GitOpsDashboard.jsonnet': importstr './GitOpsDashboard.grafonnet',
  })
)

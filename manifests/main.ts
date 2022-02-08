import { Construct, Node } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';

import CRDs from './crds/crds';
import Operator from './operator/operator';
import Dashboards from './dashboards/dashboards';

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const crds = new CRDs(this);
    const operator = new Operator(this);
    new Dashboards(this);

    Node.of(operator).addDependency(crds);
  }
}

const app = new App();
const chart = new MyChart(app, 'jabos');
app.synth();
chart.toString();
// console.log(JSON.stringify(chart.toJson()))

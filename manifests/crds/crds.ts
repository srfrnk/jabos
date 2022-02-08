import { Construct } from 'constructs';
import DockerImage from './dockerImage';
import GitRepository from './gitRepository';
import HelmTemplateManifests from './helmTemplateManifests';
import JsonnetManifests from './jsonnetManifests';
import KustomizeManifests from './kustomizeManifests';
import PlainManifests from './plainManifests';

export default class CRDs extends Construct {
  constructor(scope: Construct) {
    super(scope, 'crds', {});
    new DockerImage(this);
    new GitRepository(this);
    new JsonnetManifests(this);
    new KustomizeManifests(this);
    new PlainManifests(this);
    new HelmTemplateManifests(this);
  }
}

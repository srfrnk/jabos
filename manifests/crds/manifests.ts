import { Construct } from 'constructs';
import { JabosCRD, JabosCRDProps } from './crd';

import * as _ from 'lodash';
import { JsonSchemaProps } from '../imports/k8s';

export interface ManifestsProps {
  readonly kind: string;
  readonly singular: string;
  readonly shortNames: string[];
  readonly schema: JsonSchemaProps;
}

export default class Manifests extends JabosCRD {

  private static buildManifestsProps(props: ManifestsProps): JabosCRDProps {
    return {
      kind: `${props.kind}Manifest`,
      singular: `${props.singular}-manifest`,
      plural: `${props.singular}-manifests`,
      shortNames: props.shortNames,
      schema: _.merge(
        {
          type: 'object',
          description: 'Build and deploy manifests',
          required: ['spec'],
          properties: {
            spec: {
              type: 'object',
              required: ['gitRepository', 'targetNamespace'],
              properties: {
                gitRepository: {
                  type: 'string',
                  description: 'The name of a `GitRepository` object which defines the codebase for the manifests. **Must be in the same namespace**.',
                },
                path: {
                  type: 'string',
                  default: '.',
                  description: 'The folder path **relative to the git repository root** where the jsonnet manifests are found.',
                },
                targetNamespace: {
                  type: 'string',
                  description: 'The namespace into which deployment should be made. **Important Note: Due to a limitation with [Metacontroller](https://github.com/metacontroller/metacontroller) this has to be the same namespace as this object is put into.**',
                },
                cleanupPolicy: {
                  type: 'string',
                  description: 'The cleanup policy to use when object is deleted. **`Delete`** will delete all created objects. **`Leave`** will leave all object intact.',
                  enum: ['Delete', 'Leave'],
                  default: 'Leave',
                },
              },
            },
            status: {
              description: 'Will contains a condition of type "`Synced`". If it becomes "`False`" an `Event` will describe the error.',
              properties: {
                builtCommit: {
                  type: 'string',
                  description: 'The latest `git` commit id build',
                },
              },
            },
          },
        },
        props.schema),
      attachments: [
        {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          resource: 'roles',
        },
        {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          resource: 'rolebindings',
        },
      ],
    };
  }

  constructor(scope: Construct, id: string, props: ManifestsProps) {
    super(scope, `${id}Manifests`, Manifests.buildManifestsProps(props));
  }
}

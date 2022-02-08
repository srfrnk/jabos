import { Construct } from 'constructs';
import { JsonSchemaProps, KubeCustomResourceDefinition, KubeCustomResourceDefinitionProps } from '../imports/k8s';
import * as _ from "lodash";

import { DecoratorController, DecoratorControllerProps, DecoratorControllerSpecAttachments } from '../imports/metacontroller.k8s.io';
import settings from '../settings';

export interface JabosCRDProps {
  readonly kind: string;
  readonly singular: string;
  readonly plural: string;
  readonly shortNames: string[];
  readonly schema: JsonSchemaProps;
  readonly attachments: DecoratorControllerSpecAttachments[];
}

export class JabosCRD extends Construct {
  private static buildCRDProps(props: JabosCRDProps): KubeCustomResourceDefinitionProps {
    const schema = _.merge({
      properties: {
        status: {
          type: 'object',
          description: 'Status of object',
          properties: {
            conditions: {
              type: 'array',
              default: [],
              description: 'List of conditions',
              items: {
                type: 'object',
                description: 'Condition',
                required: ['type', 'status'],
                properties: {
                  type: {
                    type: 'string',
                    description: 'Type of condition',
                  },
                  status: {
                    type: 'string',
                    description: 'Status of the condition, one of **True**, **False**, **Unknown**',
                    enum: ['True', 'False', 'Unknown'],
                  },
                  reason: {
                    type: 'string',
                    description: "One-word CamelCase reason for the condition's last transition",
                  },
                  message: {
                    type: 'string',
                    description: 'Human-readable message indicating details about last transition',
                  },
                  lastHeartbeatTime: {
                    type: 'string',
                    description: 'Last time we got an update on a given condition',
                  },
                  lastTransitionTime: {
                    type: 'string',
                    description: 'Last time the condition transit from one status to another',
                  },
                },
              },
            },
            latestCommit: {
              type: 'string',
              description: 'The latest `git` commit id found',
            }
          },
        }
      },
    }, props.schema);

    return {
      metadata: {
        name: `${props.plural}.${settings.crdGroup()}`
      },
      spec: {
        group: settings.crdGroup(),
        names: {
          kind: props.kind,
          plural: props.plural,
          singular: props.singular,
          shortNames: props.shortNames,
        },
        scope: "Namespaced",
        versions: [{
          name: settings.crdVersion(),
          served: true,
          storage: true,
          subresources: {
            status: {}
          },
          schema: {
            openApiv3Schema: schema
          }
        }]
      }
    };
  }

  private static buildControllerProps(props: JabosCRDProps): DecoratorControllerProps {
    const webHook = (name: string): any => ({
      webhook: {
        url: `http://operator.${settings.jabosNamespace()}:${settings.operatorPort()}/${props.plural}-${name}`,
        timeout: settings.operatorTimeout(),
      },
    });

    return {
      metadata: {
        name: `${props.plural}-controller`,
        namespace: settings.jabosNamespace(),
      },
      spec: {
        resources: [
          {
            apiVersion: `${settings.crdGroup()}/${settings.crdVersion()}`,
            resource: props.plural,
          },
        ],
        attachments: [
          {
            apiVersion: 'batch/v1',
            resource: 'jobs',
            updateStrategy: {
              method: 'InPlace',
            },
          },
          ...props.attachments
        ],
        hooks:
        {
          sync: webHook('sync'),
          customize: webHook('customize'),
          finalize: webHook('finalize')
        },
        resyncPeriodSeconds: settings.operatorResyncPeriodSeconds(),
      },
    };
  }

  constructor(scope: Construct, id: string, props: JabosCRDProps) {
    super(scope, id, {});
    const crd = new KubeCustomResourceDefinition(this, `${id}CRD`, JabosCRD.buildCRDProps(props));
    const controller = new DecoratorController(this, `${id}Controller`, JabosCRD.buildControllerProps(props));
    controller.addDependency(crd);
  }
}

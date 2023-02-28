import { Construct } from 'constructs';
import {
  constructId,
  generateName,
  Casing
} from '@tinystacks/iac-utils';
import {
  LogGroup,
  RetentionDays
} from 'aws-cdk-lib/aws-logs';
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  ComputeType,
  EventAction,
  FilterGroup,
  LinuxArmBuildImage,
  LinuxBuildImage,
  Project,
  Source
} from 'aws-cdk-lib/aws-codebuild';
import { RemovalPolicy } from 'aws-cdk-lib';
import { name } from '../../../package.json';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture } from '../types';

interface DevBuildProps {
  architecture: Architecture;
  manifestRelease: Project;
  ecrRepo: Repository
}

class DevBuild extends Construct {
  codebuildProject: Project;
  constructor (scope: Construct, id: string, props: DevBuildProps) {
    super(scope, id);

    const {
      architecture,
      manifestRelease,
      ecrRepo
    } = props;

    const projectName = `${name}-${architecture}-dev-build`;

    const logGroupName = generateName({
      identifiers: [projectName, 'logs'],
      casing: Casing.KEBAB
    });
    const logGroup = new LogGroup(this, constructId(logGroupName), {
      logGroupName,
      retention: RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY
    });

    this.codebuildProject = new Project(this, constructId(projectName), {
      projectName,
      buildSpec: BuildSpec.fromSourceFilename('buildspecs/dev-build.yml'),
      environment: {
        buildImage: architecture === 'arm' ? LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_2_0 : LinuxBuildImage.STANDARD_6_0,
        computeType: ComputeType.SMALL,
        privileged: true,
        environmentVariables: {
          NPM_TOKEN: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: '/CodeBuild/NPM_TOKEN'
          },
          ARCH: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: architecture
          },
          RELEASE_PROJECT: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: manifestRelease.projectName
          }
        }
      },
      logging: {
        cloudWatch: {
          logGroup
        }
      },
      source: Source.gitHub({
        owner: 'tinystacks',
        repo: 'ops-frontend',
        branchOrRef: 'main',
        webhook: true,
        webhookFilters: [
          FilterGroup
            .inEventOf(EventAction.PUSH)
            .andBranchIs('main')
        ]
      })
    });

    this.codebuildProject.addToRolePolicy(new PolicyStatement({
      actions: [
        'ecr:BatchGet*',
        'ecr:Get*',
        'ecr:Describe*',
        'ecr:List*',
        'ecr:GetAuthorizationToken',
        'sts:GetServiceBearerToken',
        'sts:GetCallerIdentity'
      ],
      resources: ['*']
    }));
    this.codebuildProject.addToRolePolicy(new PolicyStatement({
      actions: [
        'ecr:BatchCheckLayerAvailability',
        'ecr:CompleteLayerUpload',
        'ecr:InitiateLayerUpload',
        'ecr:ListImages',
        'ecr:PutImage',
        'ecr:UploadLayerPart'
      ],
      resources: [ecrRepo.repositoryArn]
    }));
    this.codebuildProject.addToRolePolicy(new PolicyStatement({
      actions: [
        'codebuild:StartBuild'
      ],
      resources: [manifestRelease.projectArn]
    }));
  }
}

export {
  DevBuild
};
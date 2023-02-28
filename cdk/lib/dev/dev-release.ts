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
  LinuxBuildImage,
  Project,
  Source
} from 'aws-cdk-lib/aws-codebuild';
import { RemovalPolicy } from 'aws-cdk-lib';
import { name } from '../../../package.json';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface DevReleaseProps {
  ecrRepo: Repository
}

class DevRelease extends Construct {
  codebuildProject: Project;
  constructor (scope: Construct, id: string, props: DevReleaseProps) {
    super(scope, id);

    const {
      ecrRepo
    } = props;

    const projectName = `${name}-dev-manifest-release`;

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
      buildSpec: BuildSpec.fromSourceFilename('buildspecs/dev-release.yml'),
      environment: {
        buildImage: LinuxBuildImage.fromCodeBuildImageId('aws/codebuild/standard:6.0'),
        computeType: ComputeType.SMALL,
        privileged: true,
        environmentVariables: {
          NPM_TOKEN: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: '/CodeBuild/NPM_TOKEN'
          },
          IMAGE_TAG: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: 'latest'
          },
          VERSION: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: 'latest'
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
        branchOrRef: 'main'
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
  }
}

export {
  DevRelease
};
import { Construct } from 'constructs';
import {
  constructId
} from '@tinystacks/iac-utils';


import { RemovalPolicy } from 'aws-cdk-lib';
import { name } from '../../../package.json';
import { Repository, TagStatus } from 'aws-cdk-lib/aws-ecr';
import { DevBuild } from './dev-build';
import { DevRelease } from './dev-release';

class DevPipeline extends Construct {
  privateEcrRepo: Repository;
  constructor (scope: Construct) {
    super(scope, 'DevPipeline');

    const ecrRepo = new Repository(this, constructId(name, 'devRepo'), {
      repositoryName: name,
      removalPolicy: RemovalPolicy.DESTROY,
      imageScanOnPush: true
    });
    ecrRepo.addLifecycleRule({
      tagStatus: TagStatus.UNTAGGED,
      maxImageCount: 25 
    });
    this.privateEcrRepo = ecrRepo;

    const release = new DevRelease(this, constructId('devRelease'), {
      ecrRepo
    });

    new DevBuild(this, constructId('x86DevBuild'), {
      architecture: 'x86',
      ecrRepo,
      manifestRelease: release.codebuildProject
    });
    
    new DevBuild(this, constructId('armDevBuild'), {
      architecture: 'arm',
      ecrRepo,
      manifestRelease: release.codebuildProject
    });
  }
}

export {
  DevPipeline
};
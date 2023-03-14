import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DevPipeline } from './dev/dev-pipeline';
import { PublicRelease } from './public/public-release';

export class CdkStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const devPipeline = new DevPipeline(this);
    new PublicRelease(this, {
      privateEcrRepo: devPipeline.privateEcrRepo
    });
  }
}
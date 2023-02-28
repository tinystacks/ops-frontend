import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DevPipeline } from './dev/dev-pipeline';
// import { PublicRelease } from './public/public-release';

export class CdkStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new DevPipeline(this);
    // new PublicRelease(this);
  }
}
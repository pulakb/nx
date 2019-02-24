import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';
import { readJsonInTree } from '../../utils/ast-utils';
import { NxJson } from '../../command-line/shared';

describe('workspace', () => {
  const schematicRunner = new SchematicTestRunner(
    '@nrwl/schematics',
    path.join(__dirname, '../../collection.json')
  );

  let projectTree: Tree;

  beforeEach(() => {
    projectTree = Tree.empty();
  });

  it('should update angular.json', () => {
    const tree = schematicRunner.runSchematic(
      'workspace',
      { name: 'proj' },
      projectTree
    );
  });

  it('should create files', () => {
    const tree = schematicRunner.runSchematic(
      'workspace',
      { name: 'proj' },
      projectTree
    );
    expect(tree.exists('/nx.json')).toBe(true);
    expect(tree.exists('/angular.json')).toBe(true);
    expect(tree.exists('/.prettierrc')).toBe(true);
    expect(tree.exists('/.prettierignore')).toBe(true);
  });

  it('should create nx.json', () => {
    const tree = schematicRunner.runSchematic(
      'workspace',
      { name: 'proj' },
      projectTree
    );
    const nxJson = readJsonInTree<NxJson>(tree, '/nx.json');
    expect(nxJson).toEqual({
      npmScope: 'proj',
      implicitDependencies: {
        'angular.json': '*',
        'package.json': '*',
        'tsconfig.json': '*',
        'tslint.json': '*',
        'nx.json': '*'
      },
      projects: {}
    });
  });

  it('should recommend vscode extensions', () => {
    const tree = schematicRunner.runSchematic(
      'workspace',
      { name: 'proj' },
      projectTree
    );
    const recommendations = readJsonInTree<{ recommendations: string[] }>(
      tree,
      '/.vscode/extensions.json'
    ).recommendations;

    expect(recommendations).toEqual([
      'nrwl.angular-console',
      'angular.ng-template',
      'ms-vscode.vscode-typescript-tslint-plugin',
      'esbenp.prettier-vscode'
    ]);
  });

  it('should configure the project to use style argument', () => {
    const tree = schematicRunner.runSchematic(
      'workspace',
      { name: 'proj', style: 'scss' },
      projectTree
    );
    expect(JSON.parse(tree.readContent('/angular.json')).schematics).toEqual({
      '@nrwl/schematics:application': {
        style: 'scss'
      },
      '@nrwl/schematics:library': {
        style: 'scss'
      }
    });
  });
});

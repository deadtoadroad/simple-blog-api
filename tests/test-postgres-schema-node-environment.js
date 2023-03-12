const { TestEnvironment: NodeEnvironment } = require("jest-environment-node");
const { exec } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { promisify } = require("node:util");

const execAsync = promisify(exec);
const prisma = "./node_modules/.bin/prisma2";

// A custom Jest test environment that creates a schema per test suite.
// This will prevent Jest workers from clashing with each other's data when running integration tests.
class TestPostgresSchemaNodeEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    const testPostgresSchema = `test-${randomBytes(4).toString("hex")}`;
    process.env.POSTGRES_SCHEMA = testPostgresSchema;
    this.global.process.env.POSTGRES_SCHEMA = testPostgresSchema;
    console.log(
      `[test-postgres-schema-node-environment] [${testPostgresSchema}] Setting up`
    );
    await execAsync(`${prisma} migrate dev`);
  }

  async teardown() {
    const testPostgresSchema = process.env.POSTGRES_SCHEMA;
    console.log(
      `[test-postgres-schema-node-environment] [${testPostgresSchema}] Tearing down`
    );
    await execAsync(
      `echo 'DROP SCHEMA IF EXISTS "${testPostgresSchema}" CASCADE;' | ${prisma} db execute --stdin`
    );
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = TestPostgresSchemaNodeEnvironment;

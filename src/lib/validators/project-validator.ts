import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import * as yaml from "yaml";

import {ProjectSchema, ResourceArraySchema} from "@/schema";

const log = {
  info: (msg: string) => console.log(chalk.blue("ℹ"), msg),
  success: (msg: string) => console.log(chalk.green("✓"), msg),
  error: (msg: string) => console.log(chalk.red("✗"), msg),
  warning: (msg: string) => console.log(chalk.yellow("⚠"), msg),
  section: (msg: string) => console.log(chalk.cyan.bold(`\n${msg}`)),
  detail: (msg: string) => console.log(chalk.gray("  →"), msg),
  celebrate: (msg: string) => console.log(chalk.magenta.bold(`\n🎉 ${msg} 🎉\n`)),
};

/**
 * Load and parse a YAML file
 */
function loadYamlFile(filePath: string): any {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(fileContent);
}

/**
 * Validate project from new split structure (metadata.yaml + resources/)
 */
async function validateSplitStructure() {
  log.section("📂 Loading project from split structure");

  // Load metadata
  const metadataPath = path.join(process.cwd(), "src", "data", "metadata.yaml");
  log.info("Reading metadata.yaml...");
  const metadata = loadYamlFile(metadataPath);
  log.success("Metadata loaded successfully");

  // Load resources
  const resourcesDir = path.join(process.cwd(), "src", "data", "resources");
  log.info("Reading resource files...");

  const resourceFiles = fs
    .readdirSync(resourcesDir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

  const resources = resourceFiles.map((file) => {
    const filePath = path.join(resourcesDir, file);
    return loadYamlFile(filePath);
  });

  log.success(`Loaded ${resources.length} resource files`);

  // Combine into project structure
  const data = { metadata, resources };

  // Validate metadata
  log.section("🔍 Validating Project Metadata");
  const metadataResult = ProjectSchema.shape.metadata.safeParse(data.metadata);

  if (!metadataResult.success) {
    log.error("Metadata validation failed");
    console.error(chalk.red(JSON.stringify(metadataResult.error.format(), null, 2)));
    throw new Error("Metadata validation failed");
  }
  log.success("Metadata validation passed");

  // Validate resources
  log.section("🔍 Validating Resources");
  const resourcesResult = ResourceArraySchema.safeParse(data.resources);

  if (!resourcesResult.success) {
    log.error("Resources validation failed");
    console.error(chalk.red(JSON.stringify(resourcesResult.error.format(), null, 2)));
    throw new Error("Resources validation failed");
  }
  log.success(`All ${data.resources.length} resources validated`);

  // Display resource types
  log.section("📋 Resource Breakdown");
  const resourceTypes = new Map<string, number>();
  for (const resource of data.resources) {
    resourceTypes.set(resource.type, (resourceTypes.get(resource.type) || 0) + 1);
  }

  for (const [type, count] of resourceTypes.entries()) {
    const bar = chalk.cyan("▓".repeat(count));
    console.log(`  ${chalk.bold(type.padEnd(15))} ${bar} ${chalk.yellow(count)}`);
  }

  // Validate complete project
  log.section("🔍 Validating Complete Project Structure");
  const projectResult = ProjectSchema.safeParse(data);

  if (!projectResult.success) {
    log.error("Project validation failed");
    console.error(chalk.red(JSON.stringify(projectResult.error.format(), null, 2)));
    throw new Error("Project validation failed");
  }
  log.success("Complete project structure validated");

  return data;
}

/**
 * Validate project from legacy single-file structure (project.yaml)
 */
async function validateLegacyStructure() {
  log.section("📂 Loading project.yaml (legacy format)");
  log.info("Reading file...");
  const fileContent = fs.readFileSync("./src/project.yaml", "utf-8");

  log.info("Parsing YAML...");
  const data = yaml.parse(fileContent);
  log.success("YAML parsed successfully");

  log.section("📊 Project Overview");
  log.detail(`Project: ${chalk.bold(data.metadata?.name)}`);
  log.detail(`Version: ${chalk.bold(data.metadata?.version)}`);
  log.detail(`Resources: ${chalk.bold(data.resources?.length || 0)}`);

  // Validate metadata
  log.section("🔍 Validating Project Metadata");
  const metadataResult = ProjectSchema.shape.metadata.safeParse(data.metadata);

  if (!metadataResult.success) {
    log.error("Metadata validation failed");
    console.error(chalk.red(JSON.stringify(metadataResult.error.format(), null, 2)));
    throw new Error("Metadata validation failed");
  }
  log.success("Metadata validation passed");

  // Validate resources
  log.section("🔍 Validating Resources");
  const resourcesResult = ResourceArraySchema.safeParse(data.resources);

  if (!resourcesResult.success) {
    log.error("Resources validation failed");
    console.error(chalk.red(JSON.stringify(resourcesResult.error.format(), null, 2)));
    throw new Error("Resources validation failed");
  }
  log.success(`All ${data.resources.length} resources validated`);

  // Display resource types
  log.section("📋 Resource Breakdown");
  const resourceTypes = new Map<string, number>();
  for (const resource of data.resources) {
    resourceTypes.set(resource.type, (resourceTypes.get(resource.type) || 0) + 1);
  }

  for (const [type, count] of resourceTypes.entries()) {
    const bar = chalk.cyan("▓".repeat(count));
    console.log(`  ${chalk.bold(type.padEnd(15))} ${bar} ${chalk.yellow(count)}`);
  }

  // Validate complete project
  log.section("🔍 Validating Complete Project Structure");
  const projectResult = ProjectSchema.safeParse(data);

  if (!projectResult.success) {
    log.error("Project validation failed");
    console.error(chalk.red(JSON.stringify(projectResult.error.format(), null, 2)));
    throw new Error("Project validation failed");
  }
  log.success("Complete project structure validated");

  return data;
}

/**
 * Main validation function - detects and validates the appropriate structure
 */
export async function validateProject() {
  try {
    const metadataPath = path.join(process.cwd(), "src", "data", "metadata.yaml");
    const legacyPath = path.join(process.cwd(), "src", "project.yaml");

    let data;

    // Check for new split structure
    if (fs.existsSync(metadataPath)) {
      data = await validateSplitStructure();
    }
    // Fall back to legacy structure
    else if (fs.existsSync(legacyPath)) {
      data = await validateLegacyStructure();
    } else {
      log.error("No valid project data found!");
      log.detail("Expected either:");
      log.detail("  - src/data/metadata.yaml + src/data/resources/");
      log.detail("  - src/project.yaml (legacy)");
      throw new Error("No valid project data found");
    }

    log.celebrate("ALL VALIDATIONS PASSED");

    log.section("✨ Final Summary");
    console.log(chalk.gray("  ┌─────────────────────────────────────"));
    console.log(chalk.gray("  │"), chalk.bold("Name:      "), chalk.green(data.metadata.name));
    console.log(chalk.gray("  │"), chalk.bold("Version:   "), chalk.green(data.metadata.version));
    console.log(chalk.gray("  │"), chalk.bold("Resources: "), chalk.green(data.resources.length));
    console.log(
      chalk.gray("  │"),
      chalk.bold("Categories:"),
      chalk.green(new Set(data.resources.map((r: any) => r.category)).size)
    );
    console.log(
      chalk.gray("  │"),
      chalk.bold("Author:    "),
      chalk.green(data.metadata.author.name)
    );
    console.log(chalk.gray("  └─────────────────────────────────────\n"));

    process.exit(0);
  } catch (error) {
    log.section("❌ Validation Failed");
    console.error(chalk.red(error));
    process.exit(1);
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateProject();
}

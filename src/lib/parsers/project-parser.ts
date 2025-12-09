import fs from "node:fs";
import path from "node:path";
import {parse} from "yaml";
import type {Project, ProjectMetadata} from "@/schema/ts/project.interface";
import type {Resource} from "@/schema/ts/types";
import {ProjectSchema} from "@/schema/zod/project.schema";

/**
 * Parse YAML file and return parsed data
 * @param filePath - Path to the YAML file
 * @returns Parsed YAML data
 */
function parseYamlFile(filePath: string): any {
  const fileContents = fs.readFileSync(filePath, "utf8");
  return parse(fileContents);
}

/**
 * Load metadata from metadata.yaml
 * @returns Parsed and validated project metadata
 */
function loadMetadata(): ProjectMetadata {
  const metadataPath = path.join(process.cwd(), "src", "data", "metadata.yaml");
  const rawMetadata = parseYamlFile(metadataPath);

  // Validate metadata using Zod schema
  const validatedMetadata = ProjectSchema.shape.metadata.parse(rawMetadata);

  return validatedMetadata as ProjectMetadata;
}

/**
 * Load all resources from the resources directory
 * @returns Array of parsed and validated resources
 */
function loadResources(): Resource[] {
  const resourcesDir = path.join(process.cwd(), "src", "data", "resources");

  // Check if resources directory exists
  if (!fs.existsSync(resourcesDir)) {
    return [];
  }

  // Get all YAML files in the resources directory
  const resourceFiles = fs
    .readdirSync(resourcesDir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));

  // Parse each resource file
  const resources: Resource[] = [];
  for (const file of resourceFiles) {
    const filePath = path.join(resourcesDir, file);
    const rawResource = parseYamlFile(filePath);
    resources.push(rawResource);
  }

  return resources;
}

/**
 * Parse and validate YAML project file (legacy single-file format)
 * @param filePath - Path to the YAML file
 * @returns Parsed and validated Project data
 */
export function parseProjectYaml(filePath: string): Project {
  const rawData = parseYamlFile(filePath);

  // Validate using Zod schema
  const validatedData = ProjectSchema.parse(rawData);

  return validatedData as Project;
}

/**
 * Load project data from the new split structure (metadata.yaml + resources/)
 * Falls back to legacy project.yaml if new structure doesn't exist
 * @returns Parsed and validated Project data
 */
export function loadProjectData(): Project {
  const metadataPath = path.join(process.cwd(), "src", "data", "metadata.yaml");
  const legacyProjectPath = path.join(process.cwd(), "src", "project.yaml");

  // Check if new structure exists (metadata.yaml)
  if (fs.existsSync(metadataPath)) {
    // Load from new split structure
    const metadata = loadMetadata();
    const resources = loadResources();

    const project: Project = {
      metadata,
      resources,
    };

    // Validate the complete project structure
    const validatedProject = ProjectSchema.parse(project);
    return validatedProject as Project;
  }

  // Fall back to legacy single file
  if (fs.existsSync(legacyProjectPath)) {
    return parseProjectYaml(legacyProjectPath);
  }

  throw new Error(
    "No project data found. Expected either:\n" +
      "  - src/data/metadata.yaml + src/data/resources/\n" +
      "  - src/project.yaml (legacy)"
  );
}

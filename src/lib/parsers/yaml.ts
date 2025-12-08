import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { Project } from "@/schema/ts/project.interface";
import { ProjectSchema } from "@/schema/zod/project.schema";

/**
 * Parse and validate YAML project file
 * @param filePath - Path to the YAML file
 * @returns Parsed and validated Project data
 */
export function parseProjectYaml(filePath: string): Project {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const rawData = parse(fileContents);

  // Validate using Zod schema
  const validatedData = ProjectSchema.parse(rawData);

  return validatedData as Project;
}

/**
 * Load project data from default location (src/project.yaml)
 * @returns Parsed and validated Project data
 */
export function loadProjectData(): Project {
  const projectPath = path.join(process.cwd(), "src", "project.yaml");
  return parseProjectYaml(projectPath);
}

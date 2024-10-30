function sortProgramsByImports(programs: string[]): string[] | Error {
    // Extract imports from each program and store them in a map
    const programImports = new Map<string, Set<string>>();
    const programToCode = new Map<string, string>();

    // Helper to extract imports from code
    const extractImports = (code: string) => {
        const importSet = new Set<string>();
        const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            importSet.add(match[1]);
        }
        return importSet;
    };

    // Populate program imports and code map
    programs.forEach((code, index) => {
        const programName = `Program${index + 1}`;
        programImports.set(programName, extractImports(code));
        programToCode.set(programName, code);
    });

    // Sort programs by dependency order, and detect cyclic dependencies
    const sortedPrograms: string[] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function dfs(programName: string): boolean {
        if (recStack.has(programName)) {
            // Cyclic dependency detected
            throw new Error(`Cyclic dependency detected involving ${programName}`);
        }

        if (visited.has(programName)) return false;

        visited.add(programName);
        recStack.add(programName);

        const imports = programImports.get(programName);
        if (imports) {
            for (const imp of imports) {
                if (programImports.has(imp) && dfs(imp)) {
                    return true; // Cyclic dependency detected in DFS path
                }
            }
        }

        recStack.delete(programName);
        sortedPrograms.push(programName);
        return false;
    }

    // Attempt to process each program
    try {
        programImports.forEach((_, programName) => {
            if (!visited.has(programName)) {
                dfs(programName);
            }
        });
    } catch (error) {
        return error as Error;
    }

    // Retrieve sorted code by program names
    return sortedPrograms.map((programName) => programToCode.get(programName)!);
}

export { sortProgramsByImports };

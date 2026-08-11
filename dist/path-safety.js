import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
function errorCode(error) {
    if (typeof error !== "object" || error === null || !("code" in error))
        return undefined;
    return typeof error.code === "string" ? error.code : undefined;
}
export async function canonicalDirectory(rootPath) {
    const root = await realpath(path.resolve(rootPath));
    const info = await lstat(root);
    if (!info.isDirectory())
        throw new Error(`Not a directory: ${rootPath}`);
    return root;
}
export async function assertNoSymlinkPath(root, target) {
    const relative = path.relative(root, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error("Target path must stay inside the repository");
    }
    let current = root;
    for (const segment of relative.split(path.sep).filter(Boolean)) {
        current = path.join(current, segment);
        try {
            const info = await lstat(current);
            if (info.isSymbolicLink()) {
                throw new Error(`Refusing to write through symbolic link: ${path.relative(root, current)}`);
            }
        }
        catch (error) {
            if (errorCode(error) === "ENOENT")
                return;
            throw error;
        }
    }
}
//# sourceMappingURL=path-safety.js.map
const PENDING_PREFIX = "pending-asset://";

export class PendingImageStore {
  private entries = new Map<string, { file: File; blobUrl: string }>();

  add(file: File): string {
    const tempId = crypto.randomUUID();
    const blobUrl = URL.createObjectURL(file);
    this.entries.set(tempId, { file, blobUrl });
    return `${PENDING_PREFIX}${tempId}`;
  }

  getBlobUrl(tempId: string): string | undefined {
    return this.entries.get(tempId)?.blobUrl;
  }

  hasPending(): boolean {
    return this.entries.size > 0;
  }

  pruneUnused(markdown: string): void {
    for (const [tempId, entry] of this.entries) {
      if (!markdown.includes(`${PENDING_PREFIX}${tempId}`)) {
        URL.revokeObjectURL(entry.blobUrl);
        this.entries.delete(tempId);
      }
    }
  }

  async uploadAll(
    uploadFn: (file: File) => Promise<string>
  ): Promise<Map<string, string>> {
    const replacements = new Map<string, string>();
    const uploads = Array.from(this.entries.entries()).map(
      async ([tempId, entry]) => {
        const realUrl = await uploadFn(entry.file);
        replacements.set(`${PENDING_PREFIX}${tempId}`, realUrl);
      }
    );
    await Promise.all(uploads);
    return replacements;
  }

  static replaceInMarkdown(
    markdown: string,
    replacements: Map<string, string>
  ): string {
    let result = markdown;
    for (const [pendingRef, realRef] of replacements) {
      result = result.split(pendingRef).join(realRef);
    }
    return result;
  }

  cleanup(): void {
    for (const entry of this.entries.values()) {
      URL.revokeObjectURL(entry.blobUrl);
    }
    this.entries.clear();
  }
}

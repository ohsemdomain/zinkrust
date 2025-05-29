/// <reference types="@cloudflare/workers-types" />

declare namespace Cloudflare {
  interface Env {
    zinkrust_kv: KVNamespace;
    zinkrust_r2: R2Bucket;
    DB: D1Database;
  }
}

interface Env extends Cloudflare.Env {}
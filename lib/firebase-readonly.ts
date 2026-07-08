import "server-only"

import { createSign } from "node:crypto"
import { readFileSync } from "node:fs"

type ServiceAccount = {
  client_email: string
  private_key: string
  project_id: string
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { referenceValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }

type FirestoreDocument = {
  name: string
  fields?: Record<string, FirestoreValue>
}

export type FirebaseDocument<T = Record<string, unknown>> = {
  id: string
  path: string
  data: T
}

let tokenCache: { token: string; expiresAt: number } | null = null

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

function parseServiceAccount() {
  const json =
    process.env.PARAWA_FIREBASE_SERVICE_ACCOUNT_JSON ??
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (json) return JSON.parse(json) as ServiceAccount

  const base64 =
    process.env.PARAWA_FIREBASE_SERVICE_ACCOUNT_BASE64 ??
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64

  if (base64) {
    return JSON.parse(
      Buffer.from(base64, "base64").toString("utf8")
    ) as ServiceAccount
  }

  const path =
    process.env.PARAWA_FIREBASE_SERVICE_ACCOUNT_PATH ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (!path) return null

  return JSON.parse(readFileSync(path, "utf8")) as ServiceAccount
}

export function hasFirebaseReadConfig() {
  return Boolean(
    process.env.PARAWA_FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.PARAWA_FIREBASE_SERVICE_ACCOUNT_BASE64 ||
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
    process.env.PARAWA_FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  )
}

function signJwt(serviceAccount: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claim = base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  )
  const body = `${header}.${claim}`
  const signer = createSign("RSA-SHA256")
  signer.update(body)
  signer.end()

  return `${body}.${base64Url(signer.sign(serviceAccount.private_key))}`
}

async function getAccessToken(serviceAccount: ServiceAccount) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signJwt(serviceAccount),
    }),
  })

  if (!response.ok) {
    throw new Error(`Firebase OAuth failed with ${response.status}`)
  }

  const json = (await response.json()) as {
    access_token: string
    expires_in?: number
  }

  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  }

  return tokenCache.token
}

function decodeValue(value: FirestoreValue | undefined): unknown {
  if (!value) return undefined
  if ("stringValue" in value) return value.stringValue
  if ("integerValue" in value) return Number(value.integerValue)
  if ("doubleValue" in value) return value.doubleValue
  if ("booleanValue" in value) return value.booleanValue
  if ("timestampValue" in value) return value.timestampValue
  if ("referenceValue" in value) return value.referenceValue
  if ("nullValue" in value) return null
  if ("arrayValue" in value) {
    return value.arrayValue.values?.map(decodeValue) ?? []
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields ?? {}).map(([key, nestedValue]) => [
        key,
        decodeValue(nestedValue),
      ])
    )
  }

  return undefined
}

function decodeDocument(document: FirestoreDocument) {
  return {
    id: document.name.split("/").at(-1) ?? document.name,
    path: document.name,
    data: Object.fromEntries(
      Object.entries(document.fields ?? {}).map(([key, value]) => [
        key,
        decodeValue(value),
      ])
    ),
  }
}

export async function listFirebaseCollection<T = Record<string, unknown>>(
  collectionId: string,
  options: { pageSize?: number; maxDocs?: number } = {}
): Promise<FirebaseDocument<T>[] | null> {
  const serviceAccount = parseServiceAccount()
  if (!serviceAccount) return null

  const projectId =
    process.env.PARAWA_FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    serviceAccount.project_id
  const pageSize = options.pageSize ?? 100
  const maxDocs = options.maxDocs ?? Number.POSITIVE_INFINITY
  const token = await getAccessToken(serviceAccount)
  const root = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  const documents: FirebaseDocument<T>[] = []
  let pageToken = ""

  while (documents.length < maxDocs) {
    const url = new URL(`${root}/${encodeURIComponent(collectionId)}`)
    const remainingDocs = maxDocs - documents.length
    url.searchParams.set("pageSize", String(Math.min(pageSize, remainingDocs)))
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(
        `Firestore ${collectionId} read failed with ${response.status}`
      )
    }

    const json = (await response.json()) as {
      documents?: FirestoreDocument[]
      nextPageToken?: string
    }

    documents.push(
      ...((json.documents ?? []).map((document) =>
        decodeDocument(document)
      ) as FirebaseDocument<T>[])
    )

    pageToken = json.nextPageToken ?? ""
    if (!pageToken) break
  }

  return documents
}

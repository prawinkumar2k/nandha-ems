/**
 * Enterprise Reliability Hub (Native IndexedDB Implementation)
 * Provides zero-dependency, asynchronous local persistence
 */

const DB_NAME = 'NEC_Nexus_Enterprise_DB';
const STORE_ASSESSMENTS = 'assessments';
const STORE_QUEUE = 'syncQueue';

export const getDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_ASSESSMENTS)) {
                db.createObjectStore(STORE_ASSESSMENTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_QUEUE)) {
                db.createObjectStore(STORE_QUEUE, { keyPath: 'qid', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const persistState = async (examId, answers, violations) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSESSMENTS, 'readwrite');
        tx.objectStore(STORE_ASSESSMENTS).put({
            id: examId,
            answers,
            violations,
            lastModified: Date.now()
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const restoreState = async (examId) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSESSMENTS, 'readonly');
        const req = tx.objectStore(STORE_ASSESSMENTS).get(examId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

export const queueRequest = async (data) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_QUEUE, 'readwrite');
        tx.objectStore(STORE_QUEUE).add({
            ...data,
            timestamp: Date.now(),
            retryCount: 0
        });
        tx.oncomplete = () => resolve();
    });
};

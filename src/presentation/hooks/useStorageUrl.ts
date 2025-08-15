import { useEffect, useState } from 'react';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../core/config/FirebaseConfig';

type State = { url?: string; loading: boolean; error?: string };

export function useStorageUrl(path?: string) {
  const [state, setState] = useState<State>({ loading: !!path });

  useEffect(() => {
    let mounted = true;
    if (!path) { setState({ loading: false }); return; }

    const r = storageRef(FIREBASE_STORAGE, path);
    getDownloadURL(r)
      .then((u) => { if (mounted) setState({ url: u, loading: false }); })
      .catch((e: any) => { if (mounted) setState({ loading: false, error: e?.message }); });

    return () => { mounted = false; };
  }, [path]);

  return state;
}
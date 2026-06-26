import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { DEFAULT_BASE_URL } from '../api/client';

export const useHostUrl = () => {
  const [hostUrl, setHostUrl] = useState<string>(DEFAULT_BASE_URL);

  useEffect(() => {
    storage.get('api_host_url').then(url => {
      if (url) setHostUrl(url);
    });
  }, []);

  return hostUrl;
};

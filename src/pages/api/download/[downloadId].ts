import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authConfig } from '~/server/auth/config';
import { getDownloadedFile } from '~/server/queue/downloadQueue';

export const config = {
  api: {
    responseLimit: false, // Disable 4MB response size limit for file downloads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
    const session = await (getServerSession as any)(req, res, authConfig);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!session?.user?.id) {
      console.log('❌ Authentication failed - no valid session');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`✅ Authenticated user: ${session.user.id}`);

    const { downloadId } = req.query;

    if (!downloadId || typeof downloadId !== 'string') {
      console.log('❌ Invalid downloadId parameter:', downloadId);
      return res.status(400).json({ error: 'Missing downloadId parameter' });
    }

    console.log(`🔍 Fetching download: ${downloadId}`);

    // Get the downloaded file
    const fileData = await getDownloadedFile(downloadId);

    if (!fileData) {
      console.log(`File not found for downloadId: ${downloadId}`);
      return res.status(404).json({ error: 'File not found or expired' });
    }

    console.log(`Serving download: ${fileData.filename} (${fileData.size} bytes)`);

    // Set appropriate headers for file download
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Length', fileData.size);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileData.filename)}`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the file buffer
    res.send(fileData.buffer);

  } catch (error) {
    console.error('Download API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
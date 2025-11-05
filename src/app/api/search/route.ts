import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3001;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');
const supabase = createClient(supabaseUrl, supabaseKey);

// (CORS Middleware)...
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/search', async (req: express.Request, res: express.Response) => {
  try {
    const { q, page: pageParam, limit: limitParam } = req.query as {
      q?: string;
      page?: string;
      limit?: string;
    };

    const query = typeof q === 'string' ? q : '';
    const page = parseInt(pageParam || '1', 10);
    
    const limit = Math.min(parseInt(limitParam || '10', 10), 50); 
    
   
    const fetchLimit = limit + 1;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const sanitizedQuery = query.trim().slice(0, 100);

    // **THE FIX: Call the new RPC function**
    const { data, error } = await supabase
      .rpc('search_listings_ranked', {
        p_search_term: sanitizedQuery,
        p_limit: fetchLimit, // Ask for limit + 1
        p_offset: offset
      });

    if (error) {
      console.error('RPC Search error:', error);
      return res.status(500).json({ error: 'Failed to perform search' });
    }

    let hasNextPage = false;
    if (data.length > limit) {
      hasNextPage = true;
      data.pop(); 
    }



    return res.json({
      results: data || [],
      pagination: {
        currentPage: page,
        hasNextPage: hasNextPage // Send this to the client
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
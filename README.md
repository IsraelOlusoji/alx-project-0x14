# MoviesDatabase API Integration

## API Overview
The MoviesDatabase API provides comprehensive and frequently updated data for movies, series, episodes, and people (actors/crew). You can search and filter titles, fetch details, ratings, cast/crew, awards, images/trailers, and more. All responses include a `results` key; paginated endpoints may also include `page`, `next`, and `entries`.

Reference: https://rapidapi.com/SAdrian/api/moviesdatabase

## Version
Version: Not specified on the provider page. Update when a version is published.

## Available Endpoints
- `/titles` (GET): Returns titles (movies, series, episodes) with optional filters and sorting.
- `/titles/{id}` (GET): Returns details for a specific title by IMDb ID.
- `/titles/{id}/ratings` (GET): Returns rating and votes for a title.
- `/titles/series/{id}` (GET): Returns light episode list (episode/season numbers) for a series.
- `/titles/seasons/{id}` (GET): Returns the number of seasons for a series.
- `/titles/series/{id}/{season}` (GET): Returns light episodes for the given season.
- `/titles/episode/{id}` (GET): Returns details for a specific episode.
- `/titles/x/upcoming` (GET): Returns upcoming titles with optional filters.
- `/titles/search/keyword/{keyword}` (GET): Searches titles by keyword.
- `/titles/search/title/{title}` (GET): Searches by title or part of a title; supports `exact=true`.
- `/titles/search/akas/{aka}` (GET): Searches by alternative names (exact, case-sensitive).
- `/actors` (GET): Returns actors with pagination.
- `/actors/{id}` (GET): Returns details for a specific actor by IMDb ID.
- `/title/utils/titleType` (GET): Returns title types.
- `/title/utils/genres` (GET): Returns genres.
- `/title/utils/lists` (GET): Returns predefined lists (e.g., top-rated, most popular).

## Request and Response Format
- Base URL: `https://moviesdatabase.p.rapidapi.com`
- Common query parameters (optional unless required by path):
  - `info` (string; default `mini_info`): Predefined sets: `base_info`, `mini_info`, `image`, `creators_directors_writers`, `revenue_budget`, `extendedCast`, `rating`, `awards`. You may also request specific title keys (e.g., `plot`, `genres`).
  - `limit` (number; default 10; max 50)
  - `page` (number; default 1)
  - `titleType` (string) – options from `/title/utils/titleType`
  - `startYear`, `endYear` (numbers) – release year range
  - `year` (number) – exact year (cannot combine with `startYear`/`endYear`)
  - `genre` (string) – case-sensitive; must match `/title/utils/genres`
  - `sort` (string) – `year.incr` (ascending), `year.decr` (descending)
  - `exact` (string; default `false`) – only for `/titles/search/title/{title}`
  - `list` (string; default `titles`) – predefined collections from `/title/utils/lists`

Example request (curl):

```bash
curl -X GET \
  'https://moviesdatabase.p.rapidapi.com/titles?list=top_rated_250&limit=10&info=base_info' \
  -H 'X-RapidAPI-Key: YOUR_RAPIDAPI_KEY' \
  -H 'X-RapidAPI-Host: moviesdatabase.p.rapidapi.com'
```

Typical response shape:

```json
{
  "results": [
    {
      "id": "tt0468569",
      "titleText": { "text": "The Dark Knight" },
      "primaryImage": { "url": "https://..." },
      "ratingsSummary": { "aggregateRating": 9.0, "voteCount": 2800000 },
      "position": 4
    }
  ],
  "page": 1,
  "next": 2,
  "entries": 250
}
```

## Authentication
Authenticate via RapidAPI headers:
- `X-RapidAPI-Key`: your RapidAPI API key
- `X-RapidAPI-Host`: `moviesdatabase.p.rapidapi.com`

Example (JavaScript/fetch):

```javascript
async function fetchTopRated() {
  const url = 'https://moviesdatabase.p.rapidapi.com/titles?list=top_rated_250&limit=10&info=base_info';
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'moviesdatabase.p.rapidapi.com'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results;
}
```

## Error Handling
Common statuses and handling tips:
- `400 Bad Request`: invalid parameters (e.g., combining `year` with `startYear`/`endYear`). Validate inputs.
- `401 Unauthorized`: missing/invalid key. Ensure `X-RapidAPI-Key` is present and correct.
- `403 Forbidden`: plan/permission issues. Check subscription and headers.
- `404 Not Found`: resource not found (e.g., invalid `id`). Handle gracefully.
- `429 Too Many Requests`: rate limit exceeded. Retry with exponential backoff and throttle.
- `5xx Server Errors`: transient issues. Retry with jitter and show fallback UI.

Example backoff helper:

```javascript
async function withBackoff(fn, attempts = 5) {
  let delay = 500;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.status || err.code || 0;
      const retriable = [429, 500, 502, 503, 504].includes(status);
      if (!retriable || i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, delay + Math.random() * 200));
      delay *= 2;
    }
  }
}
```

## Usage Limits and Best Practices
- Rate limits and quotas depend on your RapidAPI plan; check your dashboard.
- Prefer `info=mini_info`; request heavier sets (`extendedCast`, `revenue_budget`) only as needed.
- Cache popular/static lists (e.g., `top_rated_250`) to reduce calls.
- Do not combine `year` with `startYear`/`endYear`.
- Ensure `genre` exactly matches `/title/utils/genres` (case-sensitive, capitalized).
- Use pagination with `limit` and `page`; stop when `next` is `null`.
- Respect 429 responses by backing off and limiting concurrency.

Reference: https://rapidapi.com/SAdrian/api/moviesdatabase

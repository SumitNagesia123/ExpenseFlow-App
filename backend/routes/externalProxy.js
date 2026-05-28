import express from "express";

const router = express.Router();

// ANY /api/external-data/*
// Protected proxy route that dynamically handles methods, queries, and bodies
router.all('/*', async (req, res) => {
    try {
        const apiKey = process.env.EXTERNAL_API_KEY;

        if (!apiKey) {
            console.error("Missing EXTERNAL_API_KEY in environment variables");
            return res.status(500).json({ error: "Server configuration error: Missing API Key" });
        }

        // 1. Build the base external URL, appending any sub-paths (e.g., /api/external-data/users -> /users)
        const baseUrl = 'https://api.example.com'; // [Insert Third-Party API Base URL here]
        const subPath = req.params[0] ? `/${req.params[0]}` : '';
        
        // 2. Append query parameters from the frontend request
        const queryString = new URLSearchParams(req.query).toString();
        const fullExternalUrl = `${baseUrl}${subPath}${queryString ? `?${queryString}` : ''}`;

        // 3. Prepare the fetch options, forwarding the method and body
        const fetchOptions = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        // Add body for POST/PUT/PATCH (ensure we don't send a body with GET/HEAD)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        // 4. Make the request to the external API
        const response = await fetch(fullExternalUrl, fetchOptions);

        // 5. Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("External API error:", response.status, errorData);
            return res.status(response.status).json({ 
                error: "Failed to fetch data from external service",
                details: errorData 
            });
        }

        // 6. Forward successful JSON response
        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Proxy route error:", err);
        res.status(500).json({ error: "Internal server error during external request" });
    }
});

export default router;

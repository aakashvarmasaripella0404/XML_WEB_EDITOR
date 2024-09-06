const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.text({ type: 'application/xml' }));

app.post('/save-xml', (req, res) => {
    fs.writeFile(path.join(__dirname, 'public', 'data.xml'), req.body, (err) => {
        if (err) {
            res.status(500).send('Error saving XML');
        } else {
            res.send('XML saved successfully');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

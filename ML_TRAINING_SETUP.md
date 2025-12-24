# ML Training Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
pip install -r requirements.txt
```

### 2. Start Backend API

```bash
npm start
```

API will run on `http://localhost:3001`

### 3. Update Frontend Config

The frontend is already configured to send data to `http://localhost:3001`. If your backend is on a different URL, update:

```javascript
// In ai-training-system.js, line ~11
config: {
    apiUrl: 'http://localhost:3001', // Change if needed
    ...
}
```

### 4. Collect Training Data

The system automatically collects data when users upload documents. To manually trigger training:

```bash
cd backend
npm run train
```

Or:

```bash
python3 train_model.py
```

## How It Works

1. **Data Collection** (Automatic)
   - Frontend collects training samples from user uploads
   - Sends to backend API at `/api/training/samples`
   - Backend stores in `training_data/` directory

2. **Model Training** (Manual or Scheduled)
   - Run `train_model.py` when you have enough data
   - Model trained using scikit-learn or TensorFlow
   - Saved to `models/` directory

3. **Model Usage** (Future)
   - Load trained model for predictions
   - Improve detection accuracy
   - Continuously improve with more data

## Training Requirements

- **Minimum**: 10 samples per tax type
- **Recommended**: 100+ samples per tax type
- **Optimal**: 1000+ samples per tax type

## What Gets Trained

The model learns to classify tax documents into:
- Income Tax
- Property Tax
- Business Tax
- Sales Tax
- Estate Tax

Based on:
- File names
- Document content
- Keywords
- Patterns

## Production Deployment

### Backend Deployment

1. Deploy to server (Node.js + Python)
2. Set environment variables
3. Configure database for training data (optional)
4. Set up job queue for training (optional)

### Model Deployment

1. Train model on server
2. Export model files
3. Deploy with application
4. Update frontend to use trained model

### Monitoring

- Track training data collection
- Monitor model accuracy
- Review user feedback
- Retrain periodically

## Security Notes

- Training data may contain sensitive information
- Ensure proper anonymization
- Secure API endpoints
- Use HTTPS in production
- Implement authentication

## Troubleshooting

**Backend not receiving data?**
- Check API is running: `curl http://localhost:3001/api/training/stats`
- Verify frontend config points to correct URL
- Check browser console for errors

**Training fails?**
- Ensure Python dependencies installed
- Check you have enough training samples
- Review error messages in console

**Model accuracy low?**
- Need more training samples
- Ensure balanced dataset (similar counts per type)
- Try different model types (sklearn vs TensorFlow)
- Review feature extraction

## Advanced: Automated Training

Set up cron job or scheduled task to retrain periodically:

```bash
# Cron job (runs daily at 2 AM)
0 2 * * * cd /path/to/backend && python3 train_model.py
```

Or use a job queue system like Bull or Celery for more control.


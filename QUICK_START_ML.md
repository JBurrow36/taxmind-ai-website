# Quick Start: ML Training

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Backend

```bash
cd backend
npm install
pip install -r requirements.txt
```

Or use the setup script:
- **Linux/Mac**: `bash setup.sh`
- **Windows**: `setup.bat`

### Step 2: Start Backend API

```bash
npm start
```

The API will run on `http://localhost:3001`

### Step 3: Train Your Model

Once you have training data collected (from user uploads), train the model:

```bash
npm run train
```

Or directly:
```bash
python3 train_model.py
```

## 📊 Check Training Status

Visit: `http://localhost:3001/api/training/stats`

Or use curl:
```bash
curl http://localhost:3001/api/training/stats
```

## 🔄 How It Works

1. **Users upload documents** → Frontend collects training data
2. **Data sent to backend** → Stored in `training_data/` directory  
3. **Train model** → Run `train_model.py`
4. **Model saved** → In `models/` directory
5. **Improve accuracy** → Model gets better with more data

## 📈 Training Requirements

- **Minimum**: 10 samples per tax type
- **Good**: 100+ samples per tax type  
- **Excellent**: 1000+ samples per tax type

The system will work with whatever data you have, but more data = better accuracy!

## 🎯 Next Steps

1. Let users upload documents (data collection happens automatically)
2. Wait until you have at least 50+ samples total
3. Run training: `npm run train`
4. Check model accuracy in training output
5. Repeat as more data comes in

## 🐛 Troubleshooting

**Backend won't start?**
- Check Node.js is installed: `node --version`
- Check port 3001 is available
- Review error messages

**Training fails?**
- Check Python is installed: `python3 --version`
- Install dependencies: `pip install scikit-learn numpy`
- Need more training samples? Check `training_data/` directory

**No training data?**
- Make sure backend API is running
- Check frontend can reach backend (check browser console)
- Verify config.apiUrl in `ai-training-system.js`

## 📝 What's Happening Behind the Scenes

- Frontend collects document uploads as training samples
- Sends to backend API automatically
- Backend stores samples in `training_data/`
- Training script processes all samples
- Trains ML model using scikit-learn or TensorFlow
- Model saved to `models/` directory
- Model accuracy improves over time!

That's it! The system is now fully set up for ML training. 🎉


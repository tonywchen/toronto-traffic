const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ATTRIBUTES = {
  LAST_PROCESSED: 'LAST_PROCESSED'
};

const SystemSettingSchema = new Schema({
  key: String,
  value: Schema.Types.Mixed
});

SystemSettingSchema.statics.findLastProcessed = async function () {
  const lastProcessedEntry = this.findOne({
    key: ATTRIBUTES.LAST_PROCESSED
  });

  return (lastProcessedEntry && lastProcessedEntry.value)
    ? lastProcessedEntry.value
    : 0
  ;
};

SystemSettingSchema.statics.setLastProcessed = async function (lastProcessed) {
  return await this.findOneAndUpdate({
    key: ATTRIBUTES.LAST_PROCESSED
  }, {
    value: lastProcessed
  }, {
    new: true,
    upsert: true
  });
};


const SystemSetting = mongoose.model('SystemSetting', SystemSettingSchema);

module.exports = SystemSetting;

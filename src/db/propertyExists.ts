import { Db } from 'mongodb';

const propertyExists = async (
  db: Db,
  collectionName: string,
  property: string,
  value: string
): Promise<boolean> => {
  try {
    return !!(await db
      .collection(collectionName)
      .findOne({ [property]: value }));
  } catch (e) {
    console.error(e);
  }
};

export default propertyExists;

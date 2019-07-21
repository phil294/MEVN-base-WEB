import { ObjectID } from 'mongodb';
import 'reflect-metadata';
import connection from '../connection';
import Attribute from '../models/Attribute';
import Product from '../models/Product';
import { error } from '../utils';

error('Generating attributes');
const attributes = [...Array(30).keys()].map(i => (Object.assign(new Attribute(), {
    subject: 'test',
    name: `attribute ${i}`,
    _id: new ObjectID('facebeefbadefaceaffeb0' + `${i}`.padStart(2, '0')), // tslint:disable-line
})));

const attribute_ids = attributes.map(a => a._id.toString());

const generate_random_primary_product_data = () => attribute_ids
    .sort(() => 0.5 - Math.random()) // random order
    .slice(0, Math.floor(Math.random() * 25)) // pick some
    .map(a => [a, `${Math.floor(Math.random() * 10)}`]) // random value v0-v-9
    .reduce((all, v) => ({ // make `data`
        ...all,
        [v[0]]: {
            verified: Math.random() > 0.25, // most are verified
            user: '123',
            value: v[1],
            source: 'src',
        },
    }), {});

(async () => {
    await connection;

    error('Deleting all attributes');
    await Attribute.delete({ subject: 'test' }); // TODO: doesnt work ??

    error('Adding dummy attributes');
    await Attribute.save(attributes);

    error('Deleting all products');
    await Product.find({ subject: 'test' });

    error('Generating dummy products');
    const products = [...Array(100).keys()].map(i => (Object.assign(new Product(), {
        subject: 'test',
        name: `product ${i}`,
        data: generate_random_primary_product_data(),
        _id: new ObjectID(`${i}`.padStart(24, '0')),
        verified: Math.random() > 0.1, // most are verified
    })));
    error('Adding dummy products');
    await Product.insert(products);

    error('Finished');
    process.exit(0);
})();

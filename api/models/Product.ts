import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import ProductData from './ProductData';

@Entity()
class Product extends BaseEntity {
    @ObjectIdColumn()
    public id!: ObjectID;
    @Column()
    public name!: string; // required todo
    @Column()
    public verified: boolean = false; // public .. ? todo
    @Column()
    public data: ProductData[] = [];
}

export default Product;

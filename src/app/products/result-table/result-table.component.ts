/**
 * User: phi
 *  .___.
 *  {o,o}
 * /)___)
 * --"-"--
 * 10.04.17
 */
import {Component, OnInit, Input, EventEmitter, Output} from "@angular/core";
import {val} from "../../helpers";
import {Product} from "../../model/Product";
import {Attribute} from "../../model/Attribute";
import {ProductService} from "../../product.service";
import {AttributeService} from "../../attribute.service";
import {GlobalService} from "../../global.service";
import {SortingOrder} from "../../search.service";

/**
 * Rendering der Suchabfrage-Ergebnisse.
 * Bietet Administratoren Editier-Möglichkeiten.
 * Sortier-Reihenfolgen werden hier konfiguriert und via @Output() sortersChanged hochgebubbelt.
 */
@Component({
	templateUrl: './result-table.component.html',
	styleUrls: ['./result-table.component.css'],
	selector: 'result-table',
})
export class ResultTableComponent implements OnInit
{

	@Input() products: Product[] = [];
	@Input() relevantAttributes: Attribute[] = [];
	private newProduct: Product = new Product();
	private newAttribute: Attribute = new Attribute();
	val = val;
	SortingOrder = SortingOrder;
	private isAdmin: boolean;
	private sorters: Array<[number, SortingOrder]> = []; // array of tuples
	@Output() sortersChanged: EventEmitter<[number, SortingOrder][]> = new EventEmitter();
	@Output() attributesChanged = new EventEmitter();

	constructor(private productService: ProductService, private attributeService: AttributeService, private globalService: GlobalService) {

	}

	private sortersFind(attribute: number) {
		return this.sorters.find((sorter: [number, SortingOrder]) => sorter[0] == attribute);
	}
	private sortersFindIndex(attribute: number) {
		return this.sorters.findIndex((sorter: [number, SortingOrder]) => sorter[0] == attribute);
	}

	ngOnInit(): void {
		this.isAdmin = this.globalService.getCurrentlyLoggedInUser().admin;
	}

	/**
	 * Adminfunktion
	 * Produktname Änderung abschicken
	 * @param product
	 * @param name
	 */
	private changeProductName(product: Product, name: string) {
		if(product.name == name) {
			return; // no change
		}
		product.name = name;
		this.productService.changeProduct(product)
			.subscribe();
	}

	/**
	 * Adminfunktion
	 * Produktwert Änderung abschicken. Resultiert in Änderung (WERT) oder Löschung (LEER).
	 * @param product
	 * @param attribute
	 * @param value
	 */
	private changeProductValue(product: Product, attribute: Attribute, value: string) {
		if(val(product.productData[attribute.id])) {
			let previousValue = product.productData[attribute.id].value;
			if(previousValue == value) {
				return; // no change
			}
		} else {
			// no value yet
			if(value == "") {
				return;
			}
			product.productData[attribute.id] = {};
		}
		//let productValue = new ProductValue();
		//productValue.value = value;
		//product.productData[attribute.id] = productValue;
		//this.productService.changeProduct(product)
		//	.subscribe();
		product.productData[attribute.id].value = value;
		if(value == "") {
			// delete
			this.productService.deleteProductValue(product.id, attribute.id)
				.subscribe();
		} else {
			// update
			this.productService.changeProductValue(product.id, attribute.id, value)
				.subscribe();
		}
	}

	/**
	 * Adminfunktion
	 * Produkt hinzufügen.
	 * @param product
	 */
	private addProduct(product: Product): void {
		this.productService.addProduct(product)
			.subscribe((addedProduct: Product) => {
				this.newProduct = new Product();
				this.products.push(addedProduct);
			});
	}

	/**
	 * Adminfunktion
	 * Produkt löschen.
	 * @param product
	 */
	private deleteProduct(product: Product): void {
		if(!confirm("Delete product '" + product.name + "'?")) {
			return;
		}
		this.productService.deleteProduct(product.id)
			.subscribe(wat => {
				this.products = this.products.filter(p => p.id != product.id); // remove successfully deleted item
			});
	}

	/**
	 * Adminfunktion
	 * Attributname Änderung abschicken.
	 * @param attribute
	 * @param newName
	 */
	private changeAttributeName(attribute: Attribute, newName: string): void {
		if(attribute.name == newName) {
			return; //nochange
		}
		attribute.name = newName;
		this.attributeService.changeAttribute(attribute)
			.subscribe();
	}

	/**
	 * Adminfunktion
	 * Attribut hinzufügen.
	 * @param attribute
	 */
	private addAttribute(attribute: Attribute): void {
		this.attributeService.addAttribute(attribute)
			.subscribe((addedAttribute: Attribute) => {
				this.newAttribute = new Attribute();
				//this.searchResponse.attributes.push(addedAttribute); // 20170617 atributes werden hier nicht verwaltet, gibt nur relevant attributes. -> neue anfrage (und neue attrs holen)
				this.attributesChanged.emit();
			});
	}

	/**
	 * Adminfunktion
	 * Attribut löschen.
	 * @param attribute
	 */
	private deleteAttribute(attribute: Attribute): void {
		if(!confirm("Delete attribute '" + attribute.name + "'?")) {
			return;
		}
		this.attributeService.deleteAttribute(attribute.id)
			.subscribe(wat => {
				// this.searchResponse.attributes = this.searchResponse.attributes.filter(a => a.id != attribute.id); // remove successfully deleted attr // 20170617 s.o.
				this.attributesChanged.emit();
			});
	}
}
/// <reference types='cypress' />

import data from '../fixtures/data.json'

describe('Test Suite', () => {
    
    beforeEach('Go to homepage', () => {
        window.localStorage.setItem('isAgeConfirmed', 'true')
        cy.visit(Cypress.config().baseUrl)
        cy.url().should('contain', Cypress.config().baseUrl)
        cy.title().should('eq', data.title)
        cy.get('.product-list-item__image > img').should('have.prop', 'naturalWidth').should('be.gt', 0)
    })

    it('Test Homepage Search', () => {
        const mainSearchVal: string[] = []
        cy.get('.main-menu__search').as('btnMainSearch').click()
        .get('.input__field').as('tfMainSearch').should('be.visible')
        .get('.search__input__close-btn').click()
        .get('@tfMainSearch').should('not.exist')
        .get('@btnMainSearch').click()
        .get('@tfMainSearch').type(data.searchValue)
        .get('.search__products__item h4').each(e => {
            cy.wrap(mainSearchVal).then(arr => arr.push(e.text()))
            // cy.wrap(e).invoke('text').then(t => mainSearchVal.push(t)) // another way
            expect(e.text()).to.contain(data.searchValue)
        })
        .get('[data-test=searchProductsButton]').click()
        .wait(1000)
        .get(".product-list-item__title, [class$='__single-value']").each((e, i) =>
            cy.wrap(mainSearchVal[i]).then(v => expect(e.text()).to.contain(v)))
    })

    it('E2E Test Add to Cart', () => {
        // verify default, add and minus quantity
        cy.get('div.product-list-item').eq(0).within(() => {
            let quantity = data.addItemCount + 1
            cy.get('.product-list-item__title').invoke('text').as('itemName')
            .get("input[name='quantity']").as('tfQuantity').should('have.value', '1')
            Cypress._.times(data.addItemCount, () => cy.get("[data-test='increaseButton']").click())
            cy.get('@tfQuantity').should('have.value', quantity)
            Cypress._.times(data.minusItemCount, () => cy.get("[data-test='subtractButton']").click())
            quantity = quantity - data.minusItemCount
            cy.wrap(quantity).as('quantity')
            cy.get('.product-list-item__price > span').invoke('text').as('unitPrice').then(p =>
                cy.wrap(quantity * Number(p.replace(/&nbsp;/g, ' ').substring(4))).as('totalPrice'))
            .get('@tfQuantity').should('have.value', quantity)
            .get('button').as('btnAddCart')
        })
        // enter delivery location
        cy.contains('Where do you want to get delivered?').click()
        cy.get('#geosuggest__input').type(data.location)
        cy.get('.geosuggest__item:first-child').click()
        cy.wait(1000)
        // add to cart
        cy.contains('span', 'ENTER').click()
        cy.get('@btnAddCart').click()
        // verify cart total quantity
        cy.get('@quantity').then(q =>
            cy.get('.main-menu__cart__quantity').should('have.text', q))
        // verify item name, quantity, unit price and total price in the cart 
        cy.get("[data-test='cartRow']").within((e: any) => {
            cy.get('@itemName').then(n =>
                cy.get("[data-test='itemName']").should('have.text', n))
            cy.get('@quantity').then(q =>
                cy.get('input').should('have.value', q))
            cy.get('@unitPrice').then(up => 
                cy.get("[data-test='unitPrice']").should('have.text', up))
            cy.get('@totalPrice').then(tp =>
                cy.get("[data-test='totalPrice']").should('contain', tp))
            // remove item from the cart and verify item is removed
            cy.get("[data-test='removeButton']").click()
            cy.get(e).should('not.exist')
        })
        // verify continue button is available
        cy.get("[name='continueShopping']").should('exist').and('be.visible').and('be.enabled')
    })

    it('Test Sorting in Search Result', () => {
        const prices = []
        cy.get('.main-menu__search').as('btnMainSearch').click()
        .get('.input__field').type(data.searchValue)
        .get('[data-test=searchProductsButton]').click()
        .wait(1000)
        .get('[data-test=productList] > a').its('length').should('be.a', 'number').and('be.gt', 0)
        .get('.product-list-item__price > span').as('price').each(e =>
            prices.push(Number(e.text().replace(/&nbsp;/g, '').substring(4))))
        // verify sort by ascending price
        .get('[data-test=sortingDropdown]').as('ddlSort').contains('Clear').click()
        .get('div[id^=react-select').as('selSortOption').contains('Price Low-High').click()
        .wait(3000)
        .wrap(prices).then(p => {
            p.sort((a, b) => a - b)
            cy.get('.product-list-item__price > span').each((e, i) => {
                expect(Number(e.text().replace(/&nbsp;/g, '').substring(4))).to.eq(p[i])
            })
        })
        // verify sort by descending price
        .get('@ddlSort').contains('Price Low-High').click()
        .get('@selSortOption').contains('Price High-Low').click()
        .wait(3000)
        .wrap(prices).then(p => {
            p.sort((a, b) => b - a)
            cy.get('.product-list-item__price > span').each((e, i) => {
                expect(Number(e.text().replace(/&nbsp;/g, '').substring(4))).to.eq(p[i])
            })
        })
    })
})
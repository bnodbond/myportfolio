/**
 * Myportfolio — Customizer Live Preview
 * Updates logo size instantly as the user drags the slider,
 * without requiring a full page refresh.
 */
( function( $ ) {

    wp.customize( 'my_portfolio_logo_size', function( value ) {
        value.bind( function( newSize ) {
            var px          = parseInt( newSize, 10 ) || 44;
            var fontPx      = Math.round( px * 0.4 );

            // Update the CSS variables on :root
            document.documentElement.style.setProperty( '--logo-size',      px + 'px' );
            document.documentElement.style.setProperty( '--logo-font-size', fontPx + 'px' );

            // Also update the style block injected by header.php (belt & suspenders)
            var styleEl = document.getElementById( 'myportfolio-logo-size' );
            if ( styleEl ) {
                styleEl.textContent =
                    ':root{--logo-size:' + px + 'px;--logo-font-size:' + fontPx + 'px;}' +
                    '.custom-logo{width:var(--logo-size)!important;height:var(--logo-size)!important;object-fit:contain;border-radius:12px;}';
            }
        } );
    } );

} )( jQuery );

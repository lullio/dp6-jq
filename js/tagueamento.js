// Preencha este arquivo com qualquer código que você necessite para realizar a
// coleta, desde a biblioteca analytics.js, gtag.js ou o snippet do Google Tag 
// Manager. No último caso, não é necessário implementar a tag <noscript>.
// O ambiente dispõe da jQuery 3.5.1, então caso deseje, poderá utilizá-la
// para fazer a sua coleta.
// Caso tenha alguma dúvida sobre o case, não hesite em entrar em contato.

// -------------------- VARIÁVEIS GLOBAIS --------------------
const pageLocation = document.URL;

// -------------------- LISTENERS --------------------

/**
 * Capturar cliques em links do menu/navbar e verifica se link é um download/PDF ou link normal.
 * Local: Todas as páginas
 */
 $('.menu a').on('click', function () {
   const linkText = $(this).text().trim();
   const linkHref = $(this).attr('href');
   const eventName = linkHref.endsWith('.pdf') ? 'file_download' : 'click';
   gtag('event', eventName, {
     page_location: pageLocation,
     element_name: sanitize(linkText),
     element_group: "menu",
     link_url: linkHref
   });
 });

/**
 * Capturar cliques nos cards de montadoras.
 * Local: https://dp6-js.lullio.com.br/analise.html#tristique
 */
$('.cards-montadoras').on('click', function (e) {
  const cardElement = $(e.target).closest('.card');
  if (!cardElement.length) return;

  const linkText = cardElement.data('id') || cardElement.find('.card-title')?.first()?.text();
  if (linkText) {
    gtag('event', 'click', {
      page_location: pageLocation,
      element_name: sanitize(linkText),
      element_group: 'ver_mais',
      link_url: cardElement.attr('href')
    });
  }
});

/**
 * Adiciona listeners para os campos do formulário.
 * 
 * form_start: quando o usuário começa a preencher um campo (focus).
 *  form_field: indica qual campo está sendo preenchido
 * 
 * form_submit: quando o usuário termina de preencher um campo (change).
 *  form_field: indica qual campo está sendo preenchido
 * 
 * Local: https://dp6-js.lullio.com.br/sobre.html#contato
 */

//  const addFieldEventListener = (eventType, eventName) => {
//   $('input').on(eventType, function() {
//     const { type, name, id, title, placeholder, checked } = this; // desestruturação

$('form').each(function () {
  // Função para obter o texto do campo com prefixo para checkboxes
  const getFieldText = (input) => {
    var type = $(input).attr('type');
    var labelText = $(input).attr('id') || $(input).attr('placeholder');
    var fieldText = labelText ? labelText.trim() : $(input).parent().find('label').text();

    // Se checkbox, adicionar prefixo "sim_" ou "nao_"
    if (type === 'checkbox') {
      var prefix = $(input).prop('checked') ? 'sim_' : 'nao_';
      fieldText = prefix + fieldText;
    }
    return fieldText;
  };

  $(this).on('focus', 'input', function () {
    if (!$(this).data('started')) {
      $(this).data('started', true); // Marca início do preenchimento

      var fieldText = getFieldText(this);
      var form = $(this).closest('form');
      gtag('event', 'form_start', {
        page_location: pageLocation,
        form_id: form.attr('id') || $(this).attr('id'),
        form_name: form.attr('name') || form.attr('class') || $(this).attr('name'),
        form_destination: form.attr('action'),
        form_field: sanitize(fieldText)
      });
    }
  });

  $(this).on('blur', 'input', function () {
    if ($(this).val().trim() !== "" && !$(this).data('filled')) {
      $(this).data('filled', true); // Marca que o campo foi preenchido

      var fieldText = getFieldText(this);
      var form = $(this).closest('form');
      gtag('event', 'form_submit', {
        page_location: pageLocation,
        form_id: form.attr('id') || $(this).attr('id'),
        form_name: form.attr('name') || form.attr('class') || $(this).attr('name'),
        form_destination: form.attr('action'),
        form_field: sanitize(fieldText)
      });
    }
  });
});


/**
 * Função para disparar o evento de sucesso no arquivo main.js
 * Local: https://dp6-js.lullio.com.br/sobre.html#contato (qualquer formulário na página)
 */
const sendFormSuccessEvent = () => {
  const form = $('form').first(); 
  const fieldText = form.find('[type=submit]').first().text();
  gtag('event', 'view_form_success', {
    page_location: pageLocation,
    form_id: form?.attr('id'),
    form_name: form?.attr('name') || form?.attr('class'),
    form_destination: form?.attr('action'),
    form_field: sanitize(fieldText),
    form_submit_text: sanitize(fieldText)
  });
};

/* -------------------- EXTRAS --------------------
Eventos adicionais implementados fora do escopo principal do case
*/

/**
 * Captura cliques em links de documentações
 * Local: https://dp6-js.lullio.com.br/index.html
 */
 $(".docs").on("click", function() {
  const text = $(this).text().trim();
  const section = $(this).closest('section');
  const title = section?.find('h4')?.first().text()?.trim() || section.find('h3, h2, h1')?.first().text()?.trim();

  if (text) {
    gtag('event', 'click', {
      page_location: pageLocation,
      element_name: sanitize(text),
      element_group: "documentacao",
      element_section: sanitize(title)
    });
  }
});

/**
 * Captura cliques em textos destacados e verifica títulos próximos ao texto clicado.
 * Local: https://dp6-js.lullio.com.br/analise.html#tristique
 */
 $("[class^=highlight]").on('click', function() {
  const highlightText = $(this).text().trim();
  let title;

  let sibling = $(this).prev().get(0) || $(this).parent().get(0);
  for (let i = 0; i < 4 && sibling; i++) {
    if ($(sibling).is('h3')) {
      title = $(sibling).text(); 
      break;
    }
    sibling = $(sibling).prev().get(0) || $(sibling).parent().get(0);
  }
  gtag('event', 'click', {
    page_location: pageLocation,
    element_name: sanitize(highlightText),
    element_group: "texto_destacado",
    element_section: sanitize(title)
  });
});

/**
 * Função auxiliar para sanitizar textos.
 * Remove caracteres especiais e formata strings com _.
 */
function sanitize(str, opts) {
  var split, i, spacer;

  if (!str) return '';
  opts = opts || {};
  spacer = typeof opts.spacer === 'string' ? opts.spacer : '_';
  str = str
    .toLowerCase()
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\s+/g, '_')
    .replace(/[áàâãåäæª]/g, 'a')
    .replace(/[éèêëЄ€]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõöøº]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç¢©]/g, 'c')
    .replace(/[^a-z0-9_\-]/g, '_');

  if (opts.capitalized) {
    split = str.replace(/^_+|_+$/g, '').split(/_+/g);
    for (i = 0; i < split.length; i++) {
      if (split[i]) split[i] = split[i][0].toUpperCase() + split[i].slice(1);
    }
    return split.join(spacer);
  }

  return str.replace(/^_+|_+$/g, '').replace(/_+/g, spacer);
}
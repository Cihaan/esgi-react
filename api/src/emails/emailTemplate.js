export function getVerificationEmailTemplate(verificationLink) {
  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <mj-section padding="20px 0">
          <mj-column>
            <mj-image width="150px" src="https://img.freepik.com/vecteurs-libre/vecteur-degrade-logo-colore-oiseau_343694-1365.jpg" alt="Connect 4 Logo"/>
          </mj-column>
        </mj-section>
        
        <mj-section background-color="#ffffff" padding="20px" border-radius="8px">
          <mj-column>
            <mj-text font-size="24px" color="#2B2D42" font-weight="bold" align="center">
              Welcome to Connect 4!
            </mj-text>
            
            <mj-text font-size="16px" color="#2B2D42" line-height="24px">
              We're excited to have you join our community of Connect 4 players! Before you can start playing and challenging others, please verify your email address.
            </mj-text>

            <mj-button 
              href="${verificationLink}"
              background-color="#EF233C"
              border-radius="4px"
              font-size="16px"
              font-weight="bold"
              padding="15px 30px"
              align="center">
              Verify Email Address
            </mj-button>

            <mj-text font-size="14px" color="#8D99AE" align="center" padding-top="20px">
              If you didn't create this account, you can safely ignore this email.
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section>
          <mj-column>
            <mj-text font-size="12px" color="#8D99AE" align="center">
              © 2024 Connect 4. All rights reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  return mjml2html(mjmlTemplate).html;
}

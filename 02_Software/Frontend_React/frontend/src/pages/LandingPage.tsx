import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, Card, CardContent, Container } from '@mui/material';

const FeatureCard = ({ title, desc }: { title: string; desc: string }) => (
  <Card sx={{
    width: 300,
    boxShadow: 3,
    height: '100%', 
    transition: 'transform 0.2s',
    textAlign: 'left',
    '&:hover': { transform: 'scale(1.02)' } 
  }}>
    <CardContent>
      <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {desc}
      </Typography>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
 
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fff',
      fontFamily: '"Inter", sans-serif'
    }}>

      <Box component="nav" sx={{
        p: 3,
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'white'
      }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#333' }}>
          Beatrix
        </Typography>

        <Box>
          <Button
            onClick={() => navigate('/login')}
            sx={{ color: '#555', mr: 2, textTransform: 'none', fontSize: '16px' }}
          >
            Autentificare
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#333',
              color: 'white',
              textTransform: 'none',
              '&:hover': { bgcolor: '#555' }
            }}
          >
            Înregistrare
          </Button>
        </Box>
      </Box>
      <Container maxWidth="lg" sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8
      }}>

        <Typography variant="h2" fontWeight="800" sx={{ mb: 3, color: '#111' }}>
          Bine ai venit la Beatrix!
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, lineHeight: 1.6, mb: 4 }}>
          Vă oferim o platformă educațională care îmbină învățarea clasică cu un <b>joc 
          serios</b>, menit să pună în practică cunoștiițne teoretice. Piesa de rezistență 
          a platformei este integrarea în procesul educațional a unui <b>robot mobil autonom</b> 
          ,care cu ajutorul <b>inteligenței artificale</b>, se adaptează pentru a fi un asistent de profesor.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 8 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Să începem!
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', color: '#333', borderColor: '#ccc' }}
          >
            Am deja un cont
          </Button>
        </Stack>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4
        }}>
          <FeatureCard
            title="Joc Interactiv 'La Boulangerie'"
            desc="Explorează o brutărie virtuală și învață vocabularul (ex: Le Croissant) printr-un joc în browser, care îți pune la încercare cunoștiințele."
          />
          <FeatureCard
            title="Asistent Robotic 4WD"
            desc="Un robot fizic care te asistă vocal, prin tehnologia text-to-speech, oferă indicii audio și se deplasează pentru a-ți menține atenția și motivația."
          />
          <FeatureCard
            title="Tutore AI (LLM)"
            desc="Un model de limbaj analizează performanța ta în timp real și generează explicații personalizate pentru greșelile făcute, încercând să te îndrume, fără să-ți dea direct răspunsul corect."
          />
        </Box>

      </Container>
      <Box component="footer" sx={{
        p: 3,
        textAlign: 'center',
        color: '#888',
        borderTop: '1px solid #eee',
        fontSize: '0.875rem'
      }}>
        Beatrix Project © 2026 • Universitatea de Vest din Timișoara
      </Box>
    </Box>
  );
};

export default LandingPage;
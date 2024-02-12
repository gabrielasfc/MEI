/*
 MD.c - a simple molecular dynamics program for simulating real gas properties of Lennard-Jones particles.
 
 Copyright (C) 2016  Jonathan J. Foley IV, Chelsea Sweet, Oyewumi Akinfenwa
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
 Electronic Contact:  foleyj10@wpunj.edu
 Mail Contact:   Prof. Jonathan Foley
 Department of Chemistry, William Paterson University
 300 Pompton Road
 Wayne NJ 07470
 
 */
#include<stdio.h>
#include<stdlib.h>
#include<math.h>
#include<string.h>
#include <immintrin.h>


// Number of particles
int N;

//  Lennard-Jones parameters in natural units!
double sigma = 1.;
double epsilon = 1.;
double m = 1.;
double kB = 1.;

double factor = 8*epsilon;
double sigma6 = sigma * sigma * sigma * sigma * sigma * sigma;
double sigma12 = sigma6 * sigma6;
double term1 = sigma12 * factor;
double term2 = sigma6 * factor;
__m256d term1Vec = _mm256_set1_pd(term1);
__m256d term2Vec = _mm256_set1_pd(term2);

double NA = 6.022140857e23;
double kBSI = 1.38064852e-23;  // m^2*kg/(s^2*K)

//  Size of box, which will be specified in natural units
double L;

//  Initial Temperature in Natural Units
double Tinit;  //2;
//  Vectors!
//
const int MAXPART=5004;
//  Position
double r[3][MAXPART];
//  Velocity
double v[3][MAXPART];
//  Acceleration
double a[3][MAXPART];

double PE = 0;
double mvs = 0;
double KE = 0;

// atom type
char atype[10];
//  Function prototypes
//  initialize positions on simple cubic lattice, also calls function to initialize velocities
void initialize();  
//  update positions and velocities using Velocity Verlet algorithm 
//  print particle coordinates to file for rendering via VMD or other animation software
//  return 'instantaneous pressure'
double VelocityVerlet(double dt, int iter, FILE *fp);  
//  Compute Force using F = -dV/dr
//  solve F = ma for use in Velocity Verlet
//  Compute total potential energy from particle coordinates
void computeAccelsAndPotential();
//  Compute Force using F = -dV/dr
void computeAccelerations();
//  Numerical Recipes function for generation gaussian distribution
double gaussdist();
//  Initialize velocities according to user-supplied initial Temperature (Tinit)
void initializeVelocities();
//  Compute mean squared velocity from particle velocities and total kinetic energy from particle mass and velocities
void MeanSqdVelocityAndKinetic();

int main()
{
    
    //  variable delcarations
    int i;
    double dt, Vol, Temp, Press, Pavg, Tavg, rho;
    double VolFac, TempFac, PressFac, timefac;
    double gc, Z;
    char trash[10000], prefix[1000], tfn[1000], ofn[1000], afn[1000];
    FILE *infp, *tfp, *ofp, *afp;
    
    
    printf("\n  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("                  WELCOME TO WILLY P CHEM MD!\n");
    printf("  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("\n  ENTER A TITLE FOR YOUR CALCULATION!\n");
    scanf("%s",prefix);
    strcpy(tfn,prefix);
    strcat(tfn,"_traj.xyz");
    strcpy(ofn,prefix);
    strcat(ofn,"_output.txt");
    strcpy(afn,prefix);
    strcat(afn,"_average.txt");
    
    printf("\n  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("                  TITLE ENTERED AS '%s'\n",prefix);
    printf("  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    
    /*     Table of values for Argon relating natural units to SI units:
     *     These are derived from Lennard-Jones parameters from the article
     *     "Liquid argon: Monte carlo and molecular dynamics calculations"
     *     J.A. Barker , R.A. Fisher & R.O. Watts
     *     Mol. Phys., Vol. 21, 657-673 (1971)
     *
     *     mass:     6.633e-26 kg          = one natural unit of mass for argon, by definition
     *     energy:   1.96183e-21 J      = one natural unit of energy for argon, directly from L-J parameters
     *     length:   3.3605e-10  m         = one natural unit of length for argon, directly from L-J parameters
     *     volume:   3.79499-29 m^3        = one natural unit of volume for argon, by length^3
     *     time:     1.951e-12 s           = one natural unit of time for argon, by length*sqrt(mass/energy)
     ***************************************************************************************/
    
    //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Edit these factors to be computed in terms of basic properties in natural units of
    //  the gas being simulated
    
    
    printf("\n  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("  WHICH NOBLE GAS WOULD YOU LIKE TO SIMULATE? (DEFAULT IS ARGON)\n");
    printf("\n  FOR HELIUM,  TYPE 'He' THEN PRESS 'return' TO CONTINUE\n");
    printf("  FOR NEON,    TYPE 'Ne' THEN PRESS 'return' TO CONTINUE\n");
    printf("  FOR ARGON,   TYPE 'Ar' THEN PRESS 'return' TO CONTINUE\n");
    printf("  FOR KRYPTON, TYPE 'Kr' THEN PRESS 'return' TO CONTINUE\n");
    printf("  FOR XENON,   TYPE 'Xe' THEN PRESS 'return' TO CONTINUE\n");
    printf("  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    scanf("%s",atype);
    
    if (strcmp(atype,"He")==0) {
        
        VolFac = 1.8399744000000005e-29;
        PressFac = 8152287.336171632;
        TempFac = 10.864459551225972;
        timefac = 1.7572698825166272e-12;
        
    }
    else if (strcmp(atype,"Ne")==0) {
        
        VolFac = 2.0570823999999997e-29;
        PressFac = 27223022.27659913;
        TempFac = 40.560648991243625;
        timefac = 2.1192341945685407e-12;
        
    }
    else if (strcmp(atype,"Ar")==0) {
        
        VolFac = 3.7949992920124995e-29;
        PressFac = 51695201.06691862;
        TempFac = 142.0950000000000;
        timefac = 2.09618e-12;
        //strcpy(atype,"Ar");
        
    }
    else if (strcmp(atype,"Kr")==0) {
        
        VolFac = 4.5882712000000004e-29;
        PressFac = 59935428.40275003;
        TempFac = 199.1817584391428;
        timefac = 8.051563913585078e-13;
        
    }
    else if (strcmp(atype,"Xe")==0) {
        
        VolFac = 5.4872e-29;
        PressFac = 70527773.72794868;
        TempFac = 280.30305642163006;
        timefac = 9.018957925790732e-13;
        
    }
    else {
        
        VolFac = 3.7949992920124995e-29;
        PressFac = 51695201.06691862;
        TempFac = 142.0950000000000;
        timefac = 2.09618e-12;
        strcpy(atype,"Ar");
        
    }
    printf("\n  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("\n                     YOU ARE SIMULATING %s GAS! \n",atype);
    printf("\n  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    
    printf("\n  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("\n  YOU WILL NOW ENTER A FEW SIMULATION PARAMETERS\n");
    printf("  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    printf("\n\n  ENTER THE INTIAL TEMPERATURE OF YOUR GAS IN KELVIN\n");
    scanf("%lf",&Tinit);
    // Make sure temperature is a positive number!
    if (Tinit<0.) {
        printf("\n  !!!!! ABSOLUTE TEMPERATURE MUST BE A POSITIVE NUMBER!  PLEASE TRY AGAIN WITH A POSITIVE TEMPERATURE!!!\n");
        exit(0);
    }
    // Convert initial temperature from kelvin to natural units
    Tinit /= TempFac;
    
    
    printf("\n\n  ENTER THE NUMBER DENSITY IN moles/m^3\n");
    printf("  FOR REFERENCE, NUMBER DENSITY OF AN IDEAL GAS AT STP IS ABOUT 40 moles/m^3\n");
    printf("  NUMBER DENSITY OF LIQUID ARGON AT 1 ATM AND 87 K IS ABOUT 35000 moles/m^3\n");
    
    scanf("%lf",&rho);
    
    N = 10*216;
    Vol = N/(rho*NA);
    
    Vol /= VolFac;
    
    //  Limiting N to MAXPART for practical reasons
    if (N>=MAXPART) {
        
        printf("\n\n\n  MAXIMUM NUMBER OF PARTICLES IS %i\n\n  PLEASE ADJUST YOUR INPUT FILE ACCORDINGLY \n\n", MAXPART);
        exit(0);
        
    }
    //  Check to see if the volume makes sense - is it too small?
    //  Remember VDW radius of the particles is 1 natural unit of length
    //  and volume = L*L*L, so if V = N*L*L*L = N, then all the particles
    //  will be initialized with an interparticle separation equal to 2xVDW radius
    if (Vol<N) {
        
        printf("\n\n\n  YOUR DENSITY IS VERY HIGH!\n\n");
        printf("  THE NUMBER OF PARTICLES IS %i AND THE AVAILABLE VOLUME IS %f NATURAL UNITS\n",N,Vol);
        printf("  SIMULATIONS WITH DENSITY GREATER THAN 1 PARTCICLE/(1 Natural Unit of Volume) MAY DIVERGE\n");
        printf("  PLEASE ADJUST YOUR INPUT FILE ACCORDINGLY AND RETRY\n\n");
        exit(0);
    }
    // Vol = L*L*L;
    // Length of the box in natural units:
    L = pow(Vol,(1./3));
    
    //  Files that we can write different quantities to
    tfp = fopen(tfn,"w");     //  The MD trajectory, coordinates of every particle at each timestep
    ofp = fopen(ofn,"w");     //  Output of other quantities (T, P, gc, etc) at every timestep
    afp = fopen(afn,"w");    //  Average T, P, gc, etc from the simulation
    
    int NumTime;
    if (strcmp(atype,"He")==0) {
        
        // dt in natural units of time s.t. in SI it is 5 f.s. for all other gasses
        dt = 0.2e-14/timefac;
        //  We will run the simulation for NumTime timesteps.
        //  The total time will be NumTime*dt in natural units
        //  And NumTime*dt multiplied by the appropriate conversion factor for time in seconds
        NumTime=50000;
    }
    else {
        dt = 0.5e-14/timefac;
        NumTime=200;
        
    }
    
    //  Put all the atoms in simple crystal lattice and give them random velocities
    //  that corresponds to the initial temperature we have specified
    initialize();
    
    //  Based on their positions, calculate the ininial intermolecular forces
    //  The accellerations of each particle will be defined from the forces and their
    //  mass, and this will allow us to update their positions via Newton's law
    computeAccelerations();
    
    // Print number of particles to the trajectory file
    fprintf(tfp,"%i\n",N);
    
    //  We want to calculate the average Temperature and Pressure for the simulation
    //  The variables need to be set to zero initially
    Pavg = 0;
    Tavg = 0;
    
    
    int tenp = floor(NumTime/10);
    double Volume = Vol * VolFac;
    fprintf(ofp,"  time (s)              T(t) (K)              P(t) (Pa)           Kinetic En. (n.u.)     Potential En. (n.u.) Total En. (n.u.)\n");
    printf("  PERCENTAGE OF CALCULATION COMPLETE:\n  [");
    for (i=0; i<NumTime+1; i++) {
        
        //  This just prints updates on progress of the calculation for the users convenience
        if (i==tenp) printf(" 10 |");
        else if (i==2*tenp) printf(" 20 |");
        else if (i==3*tenp) printf(" 30 |");
        else if (i==4*tenp) printf(" 40 |");
        else if (i==5*tenp) printf(" 50 |");
        else if (i==6*tenp) printf(" 60 |");
        else if (i==7*tenp) printf(" 70 |");
        else if (i==8*tenp) printf(" 80 |");
        else if (i==9*tenp) printf(" 90 |");
        else if (i==10*tenp) printf(" 100 ]\n");
        fflush(stdout);
        
        
        // This updates the positions and velocities using Newton's Laws
        // Also computes the Pressure as the sum of momentum changes from wall collisions / timestep
        // which is a Kinetic Theory of gasses concept of Pressure
        Press = VelocityVerlet(dt, i+1, tfp);
        Press *= PressFac;
        
        //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //  Now we would like to calculate somethings about the system:
        //  Instantaneous mean velocity squared, Temperature, Pressure and Kinetic Energy
        //  We would also like to use the IGL to try to see if we can extract the gas constant
        MeanSqdVelocityAndKinetic();
        
        // Temperature from Kinetic Theory
        Temp = m*mvs/(3*kB) * TempFac;
        
        // Instantaneous gas constant and compressibility - not well defined because
        // pressure may be zero in some instances because there will be zero wall collisions,
        // pressure may be very high in some instances because there will be a number of collisions
        gc = NA*Press*Volume/(N*Temp);
        Z  = Press*Volume/(N*kBSI*Temp);
        
        Tavg += Temp;
        Pavg += Press;

        fprintf(ofp,"  %8.4e  %20.8f  %20.8f %20.8f  %20.8f  %20.8f \n",i*dt*timefac,Temp,Press,KE, PE, KE+PE);
    }
    
    // Because we have calculated the instantaneous temperature and pressure,
    // we can take the average over the whole simulation here
    Pavg /= NumTime;
    Tavg /= NumTime;
    Z = Pavg*Volume/(N*kBSI*Tavg);
    gc = NA*Pavg*Volume/(N*Tavg);
    fprintf(afp,"  Total Time (s)      T (K)               P (Pa)      PV/nT (J/(mol K))         Z           V (m^3)              N\n");
    fprintf(afp," --------------   -----------        ---------------   --------------   ---------------   ------------   -----------\n");
    fprintf(afp,"  %8.4e  %15.5f       %15.5f     %10.5f       %10.5f        %10.5e         %i\n",i*dt*timefac,Tavg,Pavg,gc,Z,Vol*VolFac,N);
    
    printf("\n  TO ANIMATE YOUR SIMULATION, OPEN THE FILE \n  '%s' WITH VMD AFTER THE SIMULATION COMPLETES\n",tfn);
    printf("\n  TO ANALYZE INSTANTANEOUS DATA ABOUT YOUR MOLECULE, OPEN THE FILE \n  '%s' WITH YOUR FAVORITE TEXT EDITOR OR IMPORT THE DATA INTO EXCEL\n",ofn);
    printf("\n  THE FOLLOWING THERMODYNAMIC AVERAGES WILL BE COMPUTED AND WRITTEN TO THE FILE  \n  '%s':\n",afn);
    printf("\n  AVERAGE TEMPERATURE (K):                 %15.5f\n",Tavg);
    printf("\n  AVERAGE PRESSURE  (Pa):                  %15.5f\n",Pavg);
    printf("\n  PV/nT (J * mol^-1 K^-1):                 %15.5f\n",gc);
    printf("\n  PERCENT ERROR of pV/nT AND GAS CONSTANT: %15.5f\n",100*fabs(gc-8.3144598)/8.3144598);
    printf("\n  THE COMPRESSIBILITY (unitless):          %15.5f \n",Z);
    printf("\n  TOTAL VOLUME (m^3):                      %10.5e \n",Volume);
    printf("\n  NUMBER OF PARTICLES (unitless):          %i \n", N);
    
    
    
    fclose(tfp);
    fclose(ofp);
    fclose(afp);
    
    return 0;
}


void initialize() {
    int n, p, i, j, k;
    double pos;
    
    // Number of atoms in each direction
    n = int(ceil(pow(N, 1.0/3)));
    
    //  spacing between atoms along a given direction
    pos = L / n;
    
    //  index for number of particles assigned positions
    p = 0;
    //  initialize positions
    for (i=0; i<n; i++) {
        for (j=0; j<n; j++) {
            for (k=0; k<n; k++) {
                if (p<N) {
                    r[0][p] = (i + 0.5)*pos;
                    r[1][p] = (j + 0.5)*pos;
                    r[2][p] = (k + 0.5)*pos;
                }
                p++;
            }
        }
    }
    
    // Call function to initialize velocities
    initializeVelocities();    
}   


//  Function to calculate the averaged velocity squared and kinetic energy of the system
void MeanSqdVelocityAndKinetic() { 
    double vSquared = 0.;
    
    for (int i=0; i<N; i++) {
        double vX = v[0][i];
        double vY = v[1][i];
        double vZ = v[2][i];

        vSquared += vX*vX + vY*vY + vZ*vZ;
    }
    
    mvs = vSquared/N;
    KE = (m/2.)*vSquared;
}

//   Uses the derivative of the Lennard-Jones potential to calculate
//   the forces on each atom.  Then uses a = F/m to calculate the
//   accelleration of each atom.
void computeAccelsAndPotential() {
    double potentialAcc = 0, values[4];
    __m256d potentialAccVec = _mm256_setzero_pd();  
    
    for (int i = 0; i < N; i++) {  // set all accelerations to zero
        for(int k = 0; k < 3; k++){
            a[k][i] = 0;
        }
    }

    for (int i = 0; i < N-1; i++) {   // loop over all distinct pairs i,j
        double aXi = 0.0, aYi = 0.0, aZi = 0.0;
        double rXi = r[0][i], rYi = r[1][i], rZi = r[2][i];
        __m256d aXiVec = _mm256_setzero_pd(), aYiVec = _mm256_setzero_pd(), aZiVec = _mm256_setzero_pd(); 
        __m256d rXiVec = _mm256_set1_pd(rXi), rYiVec = _mm256_set1_pd(rYi), rZiVec = _mm256_set1_pd(rZi);

        // Non Vectorised code
        int j = i+1;
        for(; j%4 != 0; j++){
            double rXij = rXi - r[0][j];
            double rYij = rYi - r[1][j];
            double rZij = rZi - r[2][j];

            double rSqd = rXij*rXij + rYij*rYij + rZij*rZij;

            double rSqdInv = 1 / rSqd;
            double rSqd3Inv = rSqdInv * rSqdInv * rSqdInv;
            double rSqd4Inv = rSqdInv * rSqd3Inv;
            double rSqd6Inv = rSqd3Inv * rSqd3Inv;

            //  From derivative of Lennard-Jones with sigma and epsilon set equal to 1 in natural units!
            double f = rSqd4Inv * (48 * rSqd3Inv - 24);

            //  from F = ma, where m = 1 in natural units!
            double fX = rXij * f;
            double fY = rYij * f;
            double fZ = rZij * f;

            aXi += fX;
            aYi += fY;
            aZi += fZ;

            a[0][j] -= fX;
            a[1][j] -= fY;
            a[2][j] -= fZ;

            potentialAcc += (term1 * rSqd6Inv) - (term2 * rSqd3Inv);
        }

        // Vectorised code
        for (; j < N; j+=4) {
            __m256d rXjVec = _mm256_load_pd(&r[0][j]);
            __m256d rYjVec = _mm256_load_pd(&r[1][j]);
            __m256d rZjVec = _mm256_load_pd(&r[2][j]);

            __m256d rXijVec = _mm256_sub_pd(rXiVec, rXjVec);
            __m256d rYijVec = _mm256_sub_pd(rYiVec, rYjVec);
            __m256d rZijVec = _mm256_sub_pd(rZiVec, rZjVec);

            __m256d rXijSqdVec = _mm256_mul_pd(rXijVec, rXijVec);
            __m256d rYijSqdVec = _mm256_mul_pd(rYijVec, rYijVec);
            __m256d rZijSqdVec = _mm256_mul_pd(rZijVec, rZijVec);

            __m256d rSqdVec = _mm256_add_pd(rXijSqdVec, _mm256_add_pd(rYijSqdVec, rZijSqdVec));

            __m256d rSqdInvVec = _mm256_div_pd(_mm256_set1_pd(1.0), rSqdVec);
            __m256d rSqd3InvVec = _mm256_mul_pd(rSqdInvVec, _mm256_mul_pd(rSqdInvVec, rSqdInvVec));
            __m256d rSqd4InvVec = _mm256_mul_pd(rSqdInvVec, rSqd3InvVec);
            __m256d rSqd6InvVec = _mm256_mul_pd(rSqd3InvVec, rSqd3InvVec);

            //  From derivative of Lennard-Jones with sigma and epsilon set equal to 1 in natural units!
            __m256d fVec = _mm256_mul_pd(rSqd4InvVec, 
                                         _mm256_sub_pd(_mm256_mul_pd(rSqd3InvVec, _mm256_set1_pd(48.0)),
                                                       _mm256_set1_pd(24.0)));

            //  from F = ma, where m = 1 in natural units!
            __m256d fXVec = _mm256_mul_pd(rXijVec, fVec);//rijX * f;
            __m256d fYVec = _mm256_mul_pd(rYijVec, fVec);
            __m256d fZVec = _mm256_mul_pd(rZijVec, fVec);

            aXiVec = _mm256_add_pd(aXiVec, fXVec);
            aYiVec = _mm256_add_pd(aYiVec, fYVec);
            aZiVec = _mm256_add_pd(aZiVec, fZVec);


            __m256d aXjVec = _mm256_load_pd(&a[0][j]);
            __m256d aYjVec = _mm256_load_pd(&a[1][j]);
            __m256d aZjVec = _mm256_load_pd(&a[2][j]);

            __m256d diffXVec = _mm256_sub_pd(aXjVec, fXVec);
            __m256d diffYVec = _mm256_sub_pd(aYjVec, fYVec);
            __m256d diffZVec = _mm256_sub_pd(aZjVec, fZVec);

            _mm256_store_pd(&a[0][j], diffXVec);
            _mm256_store_pd(&a[1][j], diffYVec);
            _mm256_store_pd(&a[2][j], diffZVec);

            potentialAccVec = _mm256_add_pd(potentialAccVec, _mm256_sub_pd(_mm256_mul_pd(term1Vec, rSqd6InvVec) , _mm256_mul_pd(term2Vec, rSqd3InvVec)));
        }

        _mm256_storeu_pd(values, aXiVec);
        a[0][i] += aXi + values[0] + values[1] + values[2] + values[3];

        _mm256_storeu_pd(values, aYiVec);
        a[1][i] += aYi + values[0] + values[1] + values[2] + values[3];

        _mm256_storeu_pd(values, aZiVec);
        a[2][i] += aZi + values[0] + values[1] + values[2] + values[3];
    }

    _mm256_storeu_pd(values, potentialAccVec);
    PE = potentialAcc + values[0] + values[1] + values[2] + values[3];
}

//   Uses the derivative of the Lennard-Jones potential to calculate
//   the forces on each atom.  Then uses a = F/m to calculate the
//   accelleration of each atom. Calculates the potential energy of the system
void computeAccelerations() {
    for (int i = 0; i < N; i++) {  // set all accelerations to zero
        for(int k = 0; k < 3; k++){
            a[k][i] = 0;
        }
    }

    for (int i = 0; i < N-1; i++) {   // loop over all distinct pairs i,j
        double aXi = 0.0, aYi = 0.0, aZi = 0.0;
        double rXi = r[0][i], rYi = r[1][i], rZi = r[2][i];

        for (int j = i+1; j < N; j++) {
            double rXij = rXi - r[0][j];
            double rYij = rYi - r[1][j];
            double rZij = rZi - r[2][j];

            double rSqd = rXij*rXij + rYij*rYij + rZij*rZij;

            double r1Inv = 1 / rSqd;
            double r3Inv = r1Inv * r1Inv * r1Inv;
            double r4Inv = r3Inv * r1Inv;

            //  From derivative of Lennard-Jones with sigma and epsilon set equal to 1 in natural units!
            double f = r4Inv * (48 * r3Inv - 24);

            //  from F = ma, where m = 1 in natural units!
            double fX = rXij * f;
            double fY = rYij * f;
            double fZ = rZij * f;

            aXi += fX;
            aYi += fY;
            aZi += fZ;

            a[0][j] -= fX;
            a[1][j] -= fY;
            a[2][j] -= fZ;
        }

        a[0][i] += aXi;
        a[1][i] += aYi;
        a[2][i] += aZi;
    }
}

// returns sum of dv/dt*m/A (aka Pressure) from elastic collisions with walls
double VelocityVerlet(double dt, int iter, FILE *fp) {
    int i, j, k;
    double psum = 0., halfDT = 0.5*dt;
    
    //  Update positions and velocity with current velocity and acceleration
    for (i=0; i<N; i++) {
        r[0][i] += dt*(v[0][i] + halfDT*a[0][i]);
        r[1][i] += dt*(v[1][i] + halfDT*a[1][i]);
        r[2][i] += dt*(v[2][i] + halfDT*a[2][i]);
            
        v[0][i] += halfDT * a[0][i];
        v[1][i] += halfDT * a[1][i];
        v[2][i] += halfDT * a[2][i];
    }

    //  Update accellerations from updated positions and potential
    computeAccelsAndPotential();

    //  Update velocity with updated acceleration
    for (i=0; i<N; i++) {
        v[0][i] += halfDT*a[0][i];
        v[1][i] += halfDT*a[1][i];
        v[2][i] += halfDT*a[2][i];
    }
    
    // Elastic walls
    for (i=0; i<N; i++) {
        for (j=0; j<3; j++) {
            if (r[j][i]<0.) {
                v[j][i] *=-1.; //- elastic walls
                psum += 2*m*fabs(v[j][i])/dt;  // contribution to pressure from "left" walls
            }
            if (r[j][i]>=L) {
                v[j][i]*=-1.;  //- elastic walls
                psum += 2*m*fabs(v[j][i])/dt;  // contribution to pressure from "right" walls
            }
        }
    }
    
    return psum/(6*L*L);
}

void initializeVelocities() {
    
    int i, j;
    
    for (i=0; i<N; i++) {
        //  Pull a number from a Gaussian Distribution
        v[0][i] = gaussdist();
        v[1][i] = gaussdist();
        v[2][i] = gaussdist();
    }
    
    // Vcm = sum_i^N  m*v_i/  sum_i^N  M
    // Compute center-of-mas velocity according to the formula above
    double vCM[3] = {0, 0, 0};
    
    for (i=0; i<N; i++) {
         vCM[0] += m*v[0][i];
         vCM[1] += m*v[1][i];
         vCM[2] += m*v[2][i];
    }
    
    
    double Nm = N*m;
    vCM[0] /= Nm;
    vCM[1] /= Nm;
    vCM[2] /= Nm;
    
    //  Subtract out the center-of-mass velocity from the
    //  velocity of each particle... effectively set the
    //  center of mass velocity to zero so that the system does
    //  not drift in space!
    for (i=0; i<N; i++) {
        v[0][i] -= vCM[0];
        v[1][i] -= vCM[1];
        v[2][i] -= vCM[2];
    }
    
    //  Now we want to scale the average velocity of the system
    //  by a factor which is consistent with our initial temperature, Tinit
    double vSqdSum, lambda;
    vSqdSum=0.;
    for (i=0; i<N; i++) {
        double vX = v[0][i];
        double vY = v[1][i];
        double vZ = v[2][i];

        vSqdSum += vX*vX + vY*vY + vZ*vZ;
    }
    
    lambda = sqrt( 3*(N-1)*Tinit/vSqdSum);
    
    for (i=0; i<N; i++) {
        v[0][i] *= lambda;
        v[1][i] *= lambda;
        v[2][i] *= lambda;
    }
}

//  Numerical recipes Gaussian distribution number generator
double gaussdist() {
    static bool available = false;
    static double gset;
    double fac, rsq, v1, v2;
    if (!available) {
        do {
            v1 = 2.0 * rand() / double(RAND_MAX) - 1.0;
            v2 = 2.0 * rand() / double(RAND_MAX) - 1.0;
            rsq = v1 * v1 + v2 * v2;
        } while (rsq >= 1.0 || rsq == 0.0);
        
        fac = sqrt(-2.0 * log(rsq) / rsq);
        gset = v1 * fac;
        available = true;
        
        return v2*fac;
    } else {
        
        available = false;
        return gset;
        
    }
}
